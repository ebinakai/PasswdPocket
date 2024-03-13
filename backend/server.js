// ESモジュール構文を使用
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { openDb, setupDatabase } from './database.js';
import { comparePassword, hashPassword, generateKey } from './functions.js';
import * as dotenv from 'dotenv'

// サーバーの設定
const app = express();
const PORT = 3010;

// リクエストボディを解析するために必要
app.use(express.json());

// .envファイルの読み込み
const env = dotenv.config();

// CORSを許可するフロントエンドのURL
const frontend_url = env.parsed.FRONTEND_URL;
const corsOptions = {
  origin: function (origin, callback) {
    if (origin === frontend_url) {
      callback(null, true);  // 許可する
    } else {
      callback(new Error('CORS Policy Violation: Not Allowed Origin'));  // 許可しない
    }
  }
};

// CORSミドルウェアを使用して、特定のオリジンからのリクエストのみを許可する
app.use(cors(corsOptions));

// 秘密鍵の生成
const SECRET_KEY = generateKey();

// データベースのセットアップ
await setupDatabase();

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
  const user = await db.get(sql, [username]);

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
  sql += 'RETURNING * '
  sql += '; ';

  // パスワードのハッシュ化
  const hashedPassword = await hashPassword(password);

  // ユーザーの登録
  try {
    const result = await db.run(sql, [username, hashedPassword]);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
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

    const passwords = await db.all(sql, [decoded.id]);
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

    const passwords = await db.all(sql, [decoded.id]);
    const key = decoded.key;
    res.json({ passwords, key });
  });
});

// パスワード追加エンドポイント
app.post('/add_password', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    const { service, username, password } = req.body;

    // SQLを生成
    let sql = '';
    sql += 'INSERT INTO passwords( ';
    sql += '  user_id, ';
    sql += '  service, ';
    sql += '  username, ';
    sql += '  password ';
    sql += ') ';
    sql += 'VALUES( ';
    sql += '  ?, ';
    sql += '  ?, ';
    sql += '  ?, ';
    sql += '  ? ';
    sql += ') ';
    sql += '; ';

    try {
      await db.run(sql, [decoded.id, service, username, password]);
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

    const { id, service, username, password } = req.body;

    // SQLを生成
    let sql = '';
    sql += 'UPDATE passwords ';
    sql += 'SET ';
    sql += '  service = ?, ';
    sql += '  username = ?, ';
    sql += '  password = ?, ';
    sql += '  updated_at = datetime("now", "localtime") ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND id = ? ';
    sql += '; ';

    try {
      await db.run(sql, [service, username, password, decoded.id, id]);
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
    sql += '  updated_at = datetime("now", "localtime"), ';
    sql += '  deleted_at = DATETIME("now") ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND id = ? ';
    sql += '; ';

    try {
      await db.run(sql, [decoded.id, id]);
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
    sql += '  updated_at = datetime("now", "localtime"), ';
    sql += '  deleted_at = NULL ';
    sql += 'WHERE ';
    sql += '  user_id = ? ';
    sql += '  AND id = ? ';
    sql += '; ';

    try {
      await db.run(sql, [decoded.id, id]);
      res.sendStatus(200); // 成功時に200 OKを送信
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // エラーが発生した場合に500 Internal Server Errorを送信
    }
  });
});

// トークンの生成
function generateToken(user) {
  const key = generateKey();
  return  {token: jwt.sign({ id: user.id, username: user.username, key:key }, SECRET_KEY, { expiresIn: '15m' }), key: key};
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
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(404).send('ユーザーが見つかりません');
    }
    
    next(decoded);
  });
}

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
