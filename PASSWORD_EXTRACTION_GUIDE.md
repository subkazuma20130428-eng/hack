📱 パスワード取得・クラック機能実装ガイド
=====================================================

## 🎯 実装内容

ハッカータイパーゲームに以下のパスワード関連機能を追加しました：

### 1. nmap コマンド拡張
**認証スクリプト実行オプション追加**

```bash
nmap <target> -script=auth
nmap <target> script
```

実行時に、スキャン結果からデフォルトパスワードなどの認証情報が表示されます。

**検出される情報:**
- SSH (OpenSSH) - デフォルト認証情報
- MySQL - ルートパスワード
- PostgreSQL - デフォルトパスワード
- Tomcat - マネージャーインターフェース認証情報

**スコア加算:** 
- 通常スキャン: +25点
- 認証スクリプト実行: +50点

---

### 2. password-dump コマンド
**パスワードハッシュダンプ機能**

```bash
password-dump <ホスト>
password-dump 192.168.1.100
```

ターゲットサーバーから `/etc/shadow` 相当のパスワードハッシュをダンプします。

**出力例:**
```
[*] パスワードダンプを実行中: 192.168.1.100
[+] /etc/shadow をダンプしました

--- Password Hash Dump ---
admin:$6$rounds=656000$...:19123:0:99999:7:::
root:$6$rounds=656000$...:19120:0:99999:7:::
postgres:$6$rounds=656000$...:19118:0:99999:7:::
mysql:$6$rounds=656000$...:19119:0:99999:7:::
tomcat:$6$rounds=656000$...:19121:0:99999:7:::

[+] ダンプファイル: /tmp/shadow_dump.txt
[!] 警告: 機密情報が取得されました
```

**スコア加算:** +30点

---

### 3. crack-password コマンド
**パスワードクラッキング機能**

```bash
crack-password <ハッシュファイル>
crack-password /tmp/shadow_dump.txt
```

パスワードハッシュを辞書ファイルを使ってクラックします。

**出力例:**
```
[*] パスワードクラック開始: /tmp/shadow_dump.txt
[*] ハッシュタイプ: SHA-512 Crypt
[*] 辞書ファイル: /usr/share/wordlists/rockyou.txt (14,344,391 行)
[*] クラック中 (これには時間がかかります...)

[+] クラック成功!

--- クラック結果 ---
admin : admin123
root : Qwerty@2024!
postgres : postgres
mysql : mysql
tomcat : tomcat

[!] 5個 / 5個 のパスワードがクラックされました
[*] 実行時間: 42.35秒
```

**スコア加算:** +45点

---

## 💡 使用例とワークフロー

### シナリオ1: パスワード情報を取得する

```bash
# ステップ 1: nmap でスキャンして脆弱性を検出
nmap target.com -script=auth

[Output]
[+] Authentication Script Results:
[SSH] OpenSSH 7.4 - Default Credentials Found:
  Username: admin
  Password: admin123
  Status: VULNERABLE

# ステップ 2: パスワードダンプを取得
password-dump target.com

[Output]
[+] ダンプファイル: /tmp/shadow_dump.txt

# ステップ 3: パスワードハッシュをクラック
crack-password /tmp/shadow_dump.txt

[Output]
[+] クラック成功!
admin : admin123
root : Qwerty@2024!
```

### シナリオ2: スコア最大化

```bash
# 高スコアを獲得するコマンド実行順序

1. nmap <target> -script=auth     (+50点)
2. password-dump <target>          (+30点)
3. crack-password <dumpfile>       (+45点)

合計スコア: +125点 (1回のセッション)
```

---

## 🔒 セキュリティ教育的側面

このゲーム機能は以下のセキュリティリスクを示しています：

### 実装されたセキュリティ脅威:
✓ デフォルトパスワードの使用  
✓ パスワードハッシュの抽出可能性  
✓ パスワードクラッキングの実現可能性  
✓ 弱いパスワードの脆弱性  
✓ サーバー認証情報の露出  

### 学習できる内容:
- 強力なパスワードの必要性
- パスワードハッシュの保護
- セキュアなサーバー設定
- デフォルト認証情報の変更
- アクセス制御の重要性

---

## 📊 コマンド統計

### スコア加算表

| コマンド | 機能 | スコア |
|---------|------|--------|
| nmap (通常) | ポートスキャン | +25点 |
| nmap -script=auth | 認証情報検出 | +50点 |
| password-dump | ハッシュダンプ | +30点 |
| crack-password | パスワードクラック | +45点 |
| **合計 (フルワークフロー)** | **情報取得→クラック** | **+150点** |

---

## 🛠️ 技術実装詳細

### nmap 認証スクリプト機能
```javascript
const includesAuthScript = target.includes('script') || target.includes('auth');

if (includesAuthScript) {
    this.printOutput(`\n[+] Authentication Script Results:\n`);
    // 各サービスのデフォルト認証情報を表示
    this.score += 50;  // 通常より高いスコア
}
```

### password-dump 実装
```javascript
cmdPASSWORDDUMP(target) {
    // SHA-512 Crypt ハッシュ形式で複数ユーザーのハッシュを表示
    // 実装されたユーザー: admin, root, postgres, mysql, tomcat
}
```

### crack-password 実装
```javascript
cmdCRACKPASSWORD(hashes) {
    // rockyou.txt 辞書を使用したパスワードクラック
    // クラック結果を表示: username : password
}
```

---

## 🎮 ゲーム内での活用

### レベル進行例
- **初級**: nmap でポートスキャンのみ (+25点)
- **中級**: nmap -script=auth でパスワード情報取得 (+50点)
- **上級**: password-dump → crack-password フルワークフロー (+75点)
- **エキスパート**: スコア最大化 (+150点)

### チャレンジモード
- 制限時間内に高スコアを獲得
- 複数サーバーからパスワードを取得
- パスワードクラック速度の競争

---

## ✅ 実装確認チェック

- ✅ nmap コマンド拡張
- ✅ password-dump コマンド追加
- ✅ crack-password コマンド追加
- ✅ スコア加算システム統合
- ✅ ヘルプテキスト実装
- ✅ リアルな出力形式

---

## 📝 ファイル更新情報

**更新ファイル**: `game/static/game/game.js`

### 追加メソッド
- `cmdPASSWORDDUMP(target)` - パスワードダンプ機能
- `cmdCRACKPASSWORD(hashes)` - パスワードクラッキング機能

### 修正メソッド
- `cmdNMAP(target)` - 認証スクリプト機能追加

### コマンドスイッチ追加
- `case 'password-dump':`
- `case 'crack-password':`

---

**実装日時**: 2026-01-17  
**バージョン**: 2.1 (Password Extraction Edition)  
**ステータス**: ✅ 完成
