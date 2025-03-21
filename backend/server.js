// ESモジュール構文を使用
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { openDb, setupDatabase } = require('./database.js');
const { comparePassword, hashPassword, generateKey } = require('./functions.js');

// サーバーの設定
const app = express();
const PORT = 80;

// リクエストボディを解析するために必要
app.use(express.json());

// CORSを許可するフロントエンドのURL
const frontend_url = process.env.FRONTEND_URL;

// CORSミドルウェアを使用して、特定のオリジンからのリクエストのみを許可する
app.use(cors({
  origin: frontend_url,
  credentials: true,
  optionsSuccessStatus: 200
}));

// 秘密鍵の生成
const SECRET_KEY = generateKey();

// ログインエンドポイント
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await openDb();

  // SQLを生成
  let sql = '';
  sql += 'SELECT ';
  sql += '  * ';
  sql += 'FROM ';
  sql += '  users ';
  sql += 'WHERE ';
  sql += '  username = ? ';
  sql += '; ';

  // ユーザーを取得
  const [rows] = await db.execute(sql, [username]);
  const user = rows[0];

  if (!user) {
    res.status(401).send('ユーザーが見つかりません');
    return;
  }

  // パスワードのハッシュ化
  const compare = await comparePassword(password, user.password);

  // ユーザーが存在し、パスワードが一致する場合
  if (user && compare) {
    const { token, key } = generateToken(user);
    res.json({ token, key });
  } else {
    res.status(401).send('認証に失敗しました');
  }
});

// サインアップエンドポイント
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const db = await openDb();

  // SQLを生成
  let sql = '';
  sql += 'INSERT INTO users( ';
  sql += '  username, ';
  sql += '  password ';
  sql += ') ';
  sql += 'VALUES( ';
  sql += '  ?, ';
  sql += '  ? ';
  sql += ') ';

  // パスワードのハッシュ化
  const hashedPassword = await hashPassword(password);

  // ユーザーの登録
  try {
    const [result] = await db.execute(sql, [username, hashedPassword]);
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];
    const { token, key } = generateToken(user);
    res.json({ token, key });

  } catch (error) {
    console.error(error);
    res.status(409).send('ユーザーが既に存在しています');
  }
});

// トークンの検証エンドポイント
app.get('/valid', async (req, res) => {
  verify(req, res, (decoded) => {
    res.json({ message: 'トークンが有効です', key: decoded.key });
  });
});

// パスワード一覧取得エンドポイント
app.get('/password_list', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    // SQLを生成
    let sql = '';
    sql += 'SELECT ';
    sql += '  * ';
    sql += 'FROM ';
    sql += '  passwords ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND deleted_at IS NULL'; // 論理削除されていないレコードのみを選択
    sql += '; ';

    const [passwords] = await db.execute(sql, [decoded.id]);
    const key = decoded.key;
    res.json({ passwords, key });
  });
});

// ゴミ箱エンドポイント
app.get('/trash_list', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    // SQLを生成
    let sql = '';
    sql += 'SELECT ';
    sql += '  * ';
    sql += 'FROM ';
    sql += '  passwords ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND deleted_at IS NOT NULL'; // 論理削除されたレコードのみを選択
    sql += '; ';

    const [passwords] = await db.execute(sql, [decoded.id]);
    const key = decoded.key;
    res.json({ passwords, key });
  });
});

// パスワード追加エンドポイント
app.post('/add_password', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    const { service, username, password, note } = req.body;

    // SQLを生成
    let sql = '';
    sql += 'INSERT INTO passwords( ';
    sql += '  user_id, ';
    sql += '  service, ';
    sql += '  username, ';
    sql += '  password, ';
    sql += '  note ';
    sql += ') ';
    sql += 'VALUES( ';
    sql += '  ?, ';
    sql += '  ?, ';
    sql += '  ?, ';
    sql += '  ?, ';
    sql += '  ? ';
    sql += ') ';
    sql += '; ';

    try {
      await db.execute(sql, [decoded.id, service, username, password, note]);
      res.sendStatus(201); // 成功時に201 Createdを送信
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // エラーが発生した場合に500 Internal Server Errorを送信
    }
  });
});

// パスワード編集エンドポイント
app.post('/edit_password', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    const { id, service, username, password, note } = req.body;

    // SQLを生成
    let sql = '';
    sql += 'UPDATE passwords ';
    sql += 'SET ';
    sql += '  service = ?, ';
    sql += '  username = ?, ';
    sql += '  password = ?, ';
    sql += '  note = ? ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND id = ? ';
    sql += '; ';

    try {
      await db.execute(sql, [service, username, password, note, decoded.id, id]);
      res.sendStatus(200); // 成功時に200 OKを送信
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // エラーが発生した場合に500 Internal Server Errorを送信
    }
  });
});

// パスワード削除エンドポイント
app.post('/delete_password', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    const { id } = req.body;

    // SQLを生成
    let sql = '';
    sql += 'UPDATE ';
    sql += '  passwords ';
    sql += 'SET ';
    sql += '  deleted_at = NOW() ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND id = ? ';
    sql += '; ';

    try {
      await db.execute(sql, [decoded.id, id]);
      res.sendStatus(200); // 成功時に200 OKを送信
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // エラーが発生した場合に500 Internal Server Errorを送信
    }
  });
});

// パスワード復元エンドポイント
app.post('/restore_password', (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    const { id } = req.body;

    // SQLを生成
    let sql = '';
    sql += 'UPDATE ';
    sql += '  passwords ';
    sql += 'SET ';
    sql += '  deleted_at = NULL ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND id = ? ';
    sql += '; ';

    try {
      await db.execute(sql, [decoded.id, id]);
      res.sendStatus(200); // 成功時に200 OKを送信
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // エラーが発生した場合に500 Internal Server Errorを送信
    }
  });
});

// トークンの生成
function generateToken(user) {
  const key = generateKey();  // ブラウザ内で保存時にマスターキーを暗号化するためのキー
  return  {token: jwt.sign({ id: user.id, key:key }, SECRET_KEY, { expiresIn: '15m' }), key: key};
}

// トークンの検証
async function verify(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).send('トークンが提供されていません');
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).send('トークンの検証に失敗しました');
    }

    const db = await openDb();
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).send('ユーザーが見つかりません');
    }
    
    next(decoded);
  });
}

async function main() {
  // データベースのセットアップ
  await setupDatabase();
  
  // サーバー起動
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
main();
