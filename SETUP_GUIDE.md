# 🎮 ハッカータイパー - Hacker Typer Game

本物のハッカー風ターミナルシミュレーターゲームです。

## 🚀 クイックスタート

### Windows
```bash
RUN_GAME.bat
```

### Linux / macOS
```bash
bash RUN_GAME.sh
```

## 📋 システム要件

- Python 3.8 以上
- 4GB 以上のメモリ推奨
- インターネット接続（初回インストール時のみ）

## 🎯 ゲーム内容

### 基本プレイ
1. アカウントを作成またはログイン
2. ターミナルコマンドを入力して実行
3. スコアを獲得
4. 対戦モードで他のプレイヤーと競う

### テストアカウント
```
ユーザー名: masumc
パスワード: kazuma20130412@@
```

## 🎮 利用可能なコマンド

合計 **330+ のコマンド** が実装されています：

### ファイル操作
- `ls` - ディレクトリ内容を表示
- `cat <file>` - ファイル内容を表示
- `mkdir <dir>` - ディレクトリを作成
- `cp <src> <dst>` - ファイルをコピー
- `rm <file>` - ファイルを削除

### システム情報
- `whoami` - 現在のユーザーを表示
- `ps` - 実行中のプロセスを表示
- `df` - ディスク容量を表示
- `uname` - システム情報を表示

### ネットワーク
- `ping <host>` - ホスト到達性をテスト
- `nmap <host>` - ポートスキャン
- `netstat` - ネットワーク接続を表示
- `ssh <user@host>` - SSH接続
- `curl <url>` - URL内容を取得

### ハッキングツール
- `sqlmap <url>` - SQL インジェクション検査
- `hydra <target>` - ブルートフォース攻撃シミュレーション
- `metasploit` - エクスプロイトフレームワーク
- `wireshark` - パケットキャプチャシミュレーション

### 開発ツール
- `gcc <file>` - C/C++ コンパイル
- `python` - Python インタプリタ
- `node` - Node.js インタプリタ
- `git <cmd>` - バージョン管理

### Tab補完
`Tab` キーを押すとコマンドやファイルパスを補完します

## 🎯 スコアシステム

- 基本コマンド: 5-20 ポイント
- ネットワーク: 15-25 ポイント
- セキュリティ: 25-40 ポイント
- ハッキング: 40-100 ポイント
- 秘密のファイル発見: +100 ポイント

## 🌐 アクセス方法

サーバー起動後、以下のURLにアクセスしてください：

```
http://localhost:8000
```

## 🔧 トラブルシューティング

### ポート 8000 が既に使用されている場合

```bash
python manage.py runserver 0.0.0.0:9000
```

### データベースをリセットしたい場合

```bash
rm db.sqlite3
python manage.py migrate
```

### 静的ファイルが読み込まれない場合

```bash
python manage.py collectstatic --noinput
```

## 📁 プロジェクト構造

```
hack/
├── game/                    # メインゲームアプリ
│   ├── templates/
│   │   └── game/
│   │       ├── index.html  # メインゲーム画面
│   │       └── battle.html # バトル画面
│   ├── static/
│   │   └── game/
│   │       ├── game.js     # ゲームロジック
│   │       ├── battle.js   # バトルロジック
│   │       └── style.css   # スタイル
│   ├── views.py            # API エンドポイント
│   ├── urls.py             # URLルーティング
│   ├── models.py           # データモデル
│   └── admin.py            # 管理画面設定
├── hacker_typer/           # プロジェクト設定
│   ├── settings.py         # Django設定
│   ├── urls.py             # メインURLルーティング
│   └── wsgi.py             # WSGI設定
├── manage.py               # Django管理コマンド
├── db.sqlite3              # SQLiteデータベース
├── RUN_GAME.bat            # Windows起動スクリプト
├── RUN_GAME.sh             # Linux/Mac起動スクリプト
└── README.md               # このファイル
```

## 🔌 API エンドポイント

### ゲーム
- `GET /` - メインゲーム画面
- `GET /battle/` - バトル画面
- `GET /api/get-word/` - コマンド取得

### ユーザー管理
- `POST /api/register/` - アカウント作成
- `POST /api/login/` - ログイン
- `POST /api/logout/` - ログアウト

### チャット
- `POST /api/send-chat/` - メッセージ送信
- `GET /api/get-chat/` - メッセージ取得

### バトル
- `POST /api/find-opponent/` - 対戦相手を探す
- `POST /api/battle-command/` - コマンド送信
- `GET /api/get-opponent-commands/` - 相手のコマンド取得

## 📱 使用技術

### バックエンド
- Django 5.2 - Webフレームワーク
- SQLite - データベース
- Python 3.8+ - プログラミング言語

### フロントエンド
- HTML5 - マークアップ
- CSS3 - スタイリング
- JavaScript (ES6+) - インタラクション

## 🛡️ セキュリティ注意事項

このゲームは**教育目的のシミュレーション**です。

実際のハッキング行為は違法です。
このゲームで学んだ知識は責任を持って使用してください。

## 📝 ライセンス

MIT License

## 👨‍💻 製作者

制作者: kazuma masuda

## 🐛 バグ報告

問題を見つけた場合は、以下の情報を含めて報告してください：

1. エラーメッセージ
2. 実行していたコマンド
3. 使用しているOS
4. Pythonのバージョン

## 📚 参考資料

- [Django ドキュメント](https://docs.djangoproject.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Python ドキュメント](https://docs.python.org/ja/)

## 🚀 今後の予定

- [ ] マルチプレイヤー対戦機能の改善
- [ ] ランキングシステム
- [ ] より多くのハッキングコマンド
- [ ] モバイル対応
- [ ] ダークモードテーマ

---

**楽しくハッキングをシミュレートしましょう！** 🎮
