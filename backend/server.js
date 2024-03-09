// ESモジュール構文を使用
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = 3000;

// リクエストボディを解析するために必要
app.use(express.json());

// CORSを全てのルートで有効にする
app.use(cors()); 

// 秘密鍵（実際のアプリケーションでは安全に管理する必要があります）
const SECRET_KEY = 'your_secret_key';

// ユーザーデータ（この例ではハードコーディングしていますが、実際にはデータベースから取得するべきです）
const users = [
  {
    id: 1,
    username: 'user1',
    password: 'password1' // 実際のアプリケーションではパスワードはハッシュ化すべきです
  },
  {
    id: 2,
    username: 'user2',
    password: 'password2'
  },
  {
    id: 3,
    username: 'root',
    password: 'root'
  }
];

// ログインエンドポイント
app.post('/login', (req, res) => {
  console.debug('login request', req.body);
  const { username, password } = req.body;

  // ユーザー名とパスワードでユーザーを検索
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // JWTを生成
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('認証に失敗しました');
  }
});

app.post('/valid', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"形式からトークンを取得

  if (!token) {
    console.debug('トークンが提供されていません');
    return res.status(403).send('トークンが提供されていません');
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.debug('トークンの検証に失敗しました');
      return res.status(401).send('トークンの検証に失敗しました');
    }

    // トークンが有効な場合、デコードされたペイロードを使用して何らかの処理を行うことができます
    // 例: ユーザーIDに基づいてユーザー情報を取得
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      console.debug('ユーザーが見つかりません');
      return res.status(404).send('ユーザーが見つかりません');
    }

    // トークンが有効で、対応するユーザーが見つかった場合、何らかの成功レスポンスを返します
      console.debug('トークンが有効です');
      res.json({ message: 'トークンが有効です', user });
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
