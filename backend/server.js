// ESモジュール構文を使用
import express from 'express';
import jwt, { decode } from 'jsonwebtoken';
import cors from 'cors';
import { openDb, setupDatabase } from './database.js';
import { comparePassword } from './functions.js';
const app = express();
const PORT = 3000;

// リクエストボディを解析するために必要
app.use(express.json());

// CORSを許可するフロントエンドのURL
const frontend_url = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
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

// 秘密鍵（実際のアプリケーションでは安全に管理する必要があります）
const SECRET_KEY = 'your_secret_key';

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

  // パスワードのハッシュ化
  const compare = await comparePassword(password, user.password);

  // ユーザーが存在し、パスワードが一致する場合
  if (user && compare) {
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '15m' });
    res.json({ token });
  } else {
    res.status(401).send('認証に失敗しました');
  }
});

// トークンの検証エンドポイント
app.post('/valid', async (req, res) => {
  verify(req, res, () => {
    res.json({ message: 'トークンが有効です' });
  });
});

// ユーザー一覧取得エンドポイント
app.post('/password_list', async (req, res) => {
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
    res.json({ passwords });
  });
});

// ゴミ箱エンドポイント
app.post('/trash_list', async (req, res) => {
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
    res.json({ passwords });
  });
});

// パスワード追加エンドポイント
app.post('/add_password', async (req, res) => {
  verify(req, res, async (decoded) => {
    const db = await openDb();

    const { service, username, password } = req.body;

    console.log(req.body);

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
    sql += '  password = ? ';
    sql += 'WHERE ';
    sql += '  id = ? ';
    sql += '; ';

    console.log(sql, [service, username, password, id]);

    try {
      await db.run(sql, [service, username, password, id]);
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
    sql += '  deleted_at = DATETIME("now") ';
    sql += 'WHERE ';
    sql += '  id = ? ';

    try {
      await db.run(sql, [id]);
      res.sendStatus(200); // 成功時に200 OKを送信
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // エラーが発生した場合に500 Internal Server Errorを送信
    }
  });
});

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
