🔐 ガチのパスワード摂取 - 完全実装ガイド
================================================

## 概要
「ガチのパスワード摂取」機能として、より現実的で多彩なパスワード抽出方法を実装しました。
複数の異なるベクトルから環境内に存在するパスワード情報を取得できます。

---

## 🎯 実装されたパスワード摂取方法

### 1️⃣ getenv - 環境変数からのパスワード抽出
**説明**: サーバーの環境変数からセットされたパスワードを取得

```bash
$ getenv DB_PASSWORD
DB_PASSWORD=Mysql@Admin2024

$ getenv ADMIN_PASSWORD
ADMIN_PASSWORD=SuperSecret#Pass123

$ getenv REDIS_PASSWORD
REDIS_PASSWORD=Redis@Secure2024

$ getenv  # すべての環境変数表示
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
HOME=/root
DB_PASSWORD=Mysql@Admin2024
ADMIN_PASSWORD=SuperSecret#Pass123
API_KEY=sk-proj-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
REDIS_PASSWORD=Redis@Secure2024
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
SSH_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
```

**検出されるパスワード:**
- DB_PASSWORD: `Mysql@Admin2024`
- ADMIN_PASSWORD: `SuperSecret#Pass123`
- API_KEY: `sk-proj-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- REDIS_PASSWORD: `Redis@Secure2024`
- JWT_SECRET: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

**スコア:** +25点（個別変数） / +40点（すべて表示）

---

### 2️⃣ extract-password - ソースコードからのパスワード抽出
**説明**: ファイルやソースコードに直接書き込まれたパスワードを検出

```bash
$ extract-password /home/user/app.py
[*] パスワード抽出開始: /home/user/app.py
[*] 一般的なパスワードパターンをスキャン中...
[*] レジストリキー、環境変数、ハードコードされた認証情報を検索中...

[+] パスワードが検出されました!

--- 抽出されたパスワード ---
[1] config.php (line 45):
    db_password = "XDV@LkQ9#mPq2"

[2] app.py (line 123):
    API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"

[3] .env.backup (line 18):
    POSTGRES_PASSWORD=pg_admin_2024!

[4] application.properties (line 52):
    spring.datasource.password=springboot@App2024

[5] docker-compose.yml (line 34):
    MYSQL_ROOT_PASSWORD=mysql_root_secure2024

[!] 計5個のパスワードが抽出されました
```

**検出されるパスワード:**
1. config.php: `XDV@LkQ9#mPq2`
2. app.py: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ`
3. .env.backup: `pg_admin_2024!`
4. application.properties: `springboot@App2024`
5. docker-compose.yml: `mysql_root_secure2024`

**スコア:** +40点

---

### 3️⃣ grep-password - パスワード関連ファイルの検索
**説明**: ディレクトリ内からパスワードが含まれるファイルを再帰検索

```bash
$ grep-password /var/www/html
[*] ディレクトリをスキャン中: /var/www/html
[*] パスワード関連ファイルを検索中...

[+] マッチするファイル:

/var/www/html/config/.db_config.conf:15:password=AdminPass@2024
/var/www/html/app/secrets.json:42:  "db_password": "secret_db_pass_123"
/var/www/html/.env:3:DATABASE_PASSWORD=postgres_secure_2024
/var/www/html/logs/backup_config.txt:67:BACKUP_PASSWORD:backup_user_pass_2024
/var/www/html/scripts/deploy.sh:28:DEPLOY_PASSWORD="deploy_pass_xyzABC123"
/var/www/html/docs/setup.md:156:Default Admin Password: initial_admin_pass_123

[!] 6個のパスワードファイルが見つかりました
```

**検出されるパスワード:**
1. .db_config.conf: `AdminPass@2024`
2. secrets.json: `secret_db_pass_123`
3. .env: `postgres_secure_2024`
4. backup_config.txt: `backup_user_pass_2024`
5. deploy.sh: `deploy_pass_xyzABC123`
6. setup.md: `initial_admin_pass_123`

**スコア:** +35点

---

### 4️⃣ ssh-keygen - SSH秘密鍵の抽出
**説明**: SSH秘密鍵から認証情報とフィンガープリントを抽出

```bash
$ ssh-keygen -l -f /root/.ssh/id_rsa
[*] SSH鍵情報を抽出中...
[*] 秘密鍵を復号化中...

-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA2x3p5q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8
m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0
s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x
Q7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c
-----END RSA PRIVATE KEY-----

[+] SSH秘密鍵を抽出しました
[+] フィンガープリント: SHA256:j2r1qYo9BTSQMyaOcqsLR9bPdQ7F9R5K8c6j+j2k+3k
[+] コメント: admin@production-server
[!] この鍵を使用して複数サーバーへアクセス可能
```

**抽出情報:**
- SSH秘密鍵 (RSA 2048-bit)
- フィンガープリント: `SHA256:j2r1qYo9BTSQMyaOcqsLR9bPdQ7F9R5K8c6j+j2k+3k`
- コメント: `admin@production-server`
- 複数サーバーアクセス可能

**スコア:** +50点（最高ボーナス）

---

## 📊 パスワード摂取ワークフロー

### シナリオ1: 環境変数からのパスワード取得
```bash
$ getenv
# 環境に設定されたすべてのパスワードを表示
# スコア: +40点
```

### シナリオ2: ソースコードからの抽出
```bash
$ extract-password /var/www/html
# 5個のパスワード検出
# スコア: +40点
```

### シナリオ3: ファイルシステム全体スキャン
```bash
$ grep-password /home
# 6個のパスワードファイル検出
# スコア: +35点
```

### シナリオ4: SSH認証情報の取得（最高難度）
```bash
$ ssh-keygen -l -f /root/.ssh/id_rsa
# SSH秘密鍵と認証情報を抽出
# スコア: +50点
```

### 🎯 完全なパスワード摂取ワークフロー

```
Step 1: 環境変数のスキャン
$ getenv
└─ +40点

Step 2: ソースコードの解析
$ extract-password /var/www/html
└─ +40点

Step 3: ファイルシステムの検索
$ grep-password /home
└─ +35点

Step 4: SSH鍵の抽出
$ ssh-keygen -l -f /root/.ssh/id_rsa
└─ +50点

合計スコア: +165点 ⭐⭐⭐⭐⭐
```

---

## 💾 取得可能なパスワード一覧

| 方法 | ユーザー名 | パスワード | スコア |
|------|-----------|-----------|--------|
| getenv | DB | Mysql@Admin2024 | 25 |
| getenv | ADMIN | SuperSecret#Pass123 | 25 |
| getenv | API | sk-proj-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6 | 20 |
| getenv | REDIS | Redis@Secure2024 | 25 |
| extract-password | admin | XDV@LkQ9#mPq2 | 40 |
| extract-password | app | eyJhbGciOiJIUzI1NiIs... | 40 |
| extract-password | postgres | pg_admin_2024! | 40 |
| extract-password | spring | springboot@App2024 | 40 |
| extract-password | mysql | mysql_root_secure2024 | 40 |
| grep-password | admin | AdminPass@2024 | 35 |
| grep-password | db | secret_db_pass_123 | 35 |
| grep-password | backup | backup_user_pass_2024 | 35 |
| grep-password | deploy | deploy_pass_xyzABC123 | 35 |
| ssh-keygen | admin | 秘密鍵 + フィンガープリント | 50 |

---

## 🔒 セキュリティ教育的価値

### このゲーム機能で学べること:

1. **環境変数漏洩の危険性**
   - パスワードを環境変数に保存する危険性
   - `.env` ファイルのセキュリティ
   - Docker/Kubernetes の認証情報管理

2. **ソースコード内のハードコード**
   - 開発環境でのパスワード硬化の危険性
   - バージョン管理システムへの機密情報混入
   - コードレビューの重要性

3. **ファイルシステムセキュリティ**
   - バックアップファイルの管理
   - 一時ファイルの削除
   - ログファイルの機密情報保護

4. **認証鍵管理**
   - SSH秘密鍵の保護
   - ファイアウォールルール
   - アクセス制御リスト

5. **多層防御の必要性**
   - 単一の対策では不十分
   - 複数のセキュリティレイヤー
   - 深層防御戦略

---

## 🎮 ゲーム難度・プレイスタイル

### 初級プレイヤー向け
```bash
getenv DB_PASSWORD
# 単一のパスワード取得
# スコア: +25点
```

### 中級プレイヤー向け
```bash
getenv              # すべての環境変数
extract-password /var/www/html
# 複数ベクトルからの攻撃
# スコア: +40+40 = +80点
```

### 上級プレイヤー向け
```bash
getenv
extract-password /var/www/html
grep-password /home
ssh-keygen -l -f /root/.ssh/id_rsa
# 完全なシステム侵害シミュレーション
# スコア: +40+40+35+50 = +165点
```

---

## 📈 実装統計

### 追加された機能
- 新規メソッド: 4個
  - `cmdGETENV()`
  - `cmdEXTRACTPASSWORD()`
  - `cmdGREPPASSWORD()`
  - `cmdSSHKEYGEN()`

- 新規コマンドスイッチケース: 4個
- 取得可能なパスワード数: 14種類以上
- 実装されたシナリオ: 10+

### コード行数
- 追加行数: 約200行
- 総メソッドサイズ: 約650行
- 実装密度: 高度なセキュリティシミュレーション

---

## 💡 今後の拡張可能性

### 段階2: より高度な攻撃ベクトル
- [ ] SQL Injection によるパスワード抽出
- [ ] データベースバックアップファイルの復号
- [ ] ログファイルからの認証情報抽出
- [ ] メモリダンプからのパスワード復元

### 段階3: 多要素認証の回避
- [ ] TOTP トークン生成
- [ ] バックアップコードの抽出
- [ ] 生体認証スプーフィング

### 段階4: ネットワークレベルの攻撃
- [ ] ネットワークトラフィックのキャプチャ
- [ ] SSL/TLS インターセプション
- [ ] DNS ポイズニング

---

## ✅ 実装確認チェック

- ✅ getenv コマンド実装
- ✅ extract-password コマンド実装
- ✅ grep-password コマンド実装
- ✅ ssh-keygen コマンド実装
- ✅ スコアシステム統合
- ✅ ヘルプテキスト実装
- ✅ リアルなパスワード情報
- ✅ 複数ベクトル実装

---

## 📝 ファイル情報

**更新ファイル**: `game/static/game/game.js`
- **総行数**: 4783行 → 約4980行 (+197行)
- **メソッド追加**: 4個
- **スイッチケース追加**: 4個

---

**実装日時**: 2026-01-17  
**バージョン**: 2.2 (Genuine Password Extraction Edition)  
**ステータス**: ✅ 完成
