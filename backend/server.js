// ESモジュール構文を使用
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { openDb, setupDatabase } from './database.js';

const app = express();
const PORT = 3000;

// リクエストボディを解析するために必要
app.use(express.json());

// CORSを全てのルートで有効にする
app.use(cors()); 

// 秘密鍵（実際のアプリケーションでは安全に管理する必要があります）
const SECRET_KEY = 'your_secret_key';

await setupDatabase();

// ログインエンドポイント
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await openDb();

  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('認証に失敗しました');
  }
});

app.post('/valid', async (req, res) => {
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

    res.json({ message: 'トークンが有効です', user });
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
