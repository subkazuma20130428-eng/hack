# 検索・調査コマンド改善レポート

## 概要
ハッカータイパーゲームの検索・調査コマンド（curl, wget, dig, whois, nmap, shodan）を大幅に改善しました。
これらのコマンドはゲーム内で「研究」や「情報収集」を行う際に、より現実的で詳細な情報を返すようになりました。

## 改善されたコマンド一覧

### 1. curl - HTTPリクエスト実行
**改善内容:**
- HTTPレスポンスヘッダーを完全に表示
- ダウンロード進度バーを表示
- Content-Typeやサーバー情報を含める
- 入力されたURLのドメイン情報をレスポンスに反映
- HTMLコンテンツサンプルを返す
- ランダムなIPアドレスを生成

**実装例:**
```javascript
cmdCURL(url) {
    // URLからドメインを抽出
    const domain = url.replace(/https?:\/\//i, '').split('/')[0];
    
    // HTTPレスポンスヘッダーを表示
    this.printOutput(`HTTP/1.1 200 OK\n`);
    this.printOutput(`Date: ${new Date().toUTCString()}\n`);
    this.printOutput(`Server: nginx/1.21.0\n`);
    // ... 詳細な情報を表示
}
```

**表示例:**
```
$ curl https://example.com

% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
100 2847  100 2847    0     0   8456      0 --:--:-- --:--:-- --:--:--  0.34s

HTTP/1.1 200 OK
Date: Fri, 21 Feb 2025 10:15:30 UTC
Server: nginx/1.21.0
Content-Type: text/html; charset=utf-8
Content-Length: 2847
Connection: keep-alive

<!DOCTYPE html>
<html>
<head>
  <title>example.com</title>
  ...
</body>
</html>
```

### 2. wget - ファイルダウンロード
**改善内容:**
- DNS解決プロセスを表示
- 接続状態を詳細に表示
- ファイルサイズを表示（KB単位）
- ダウンロード進度バー
- 速度情報を表示
- 完了時刻を表示

**表示例:**
```
$ wget https://example.com/file.zip

--Friday, 02/21/2025 10:15:30 AM--  https://example.com/file.zip
DNS resolution... 203.45.67.89
Connecting to example.com:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2847 (2.8K) [text/html]
Saving to: 'index.html'

2847      100%  [========================================] 2.8K in 0.25s

Friday, 02/21/2025 10:15:31 AM (2.8K/s) - 'index.html' saved [2847/2847]
```

### 3. dig - DNS問い合わせ
**改善内容:**
- 完全なDNSクエリ/レスポンス構造を表示
- ランダムなIPアドレスを生成
- QUESTION SECTION を表示
- ANSWER SECTION を表示
- AUTHORITY SECTION を表示（ネームサーバー情報）
- クエリ時間を表示
- DNSサーバー情報を表示

**表示例:**
```
$ dig example.com

; <<>> DiG 9.16.1 <<>> example.com
; (1 server found)
; global options: +cmd
; Got answer:
; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345
; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 1

; QUESTION SECTION:
; example.com.                     IN  A

; ANSWER SECTION:
example.com.    300  IN  A    192.168.45.123

; AUTHORITY SECTION:
example.com.    172800  IN  NS   ns1.example.com.
example.com.    172800  IN  NS   ns2.example.com.

; Query time: 45 msec
; SERVER: 8.8.8.8#53(8.8.8.8)
; WHEN: Fri, 21 Feb 2025 10:15:30 UTC
; MSG SIZE  rcvd: 256
```

### 4. whois - ドメイン登録情報
**改善内容:**
- 詳細なドメイン登録情報を表示
- ランダムな登録日時を生成（2005-2024年のランダム）
- 有効期限を表示
- レジストラ情報を表示
- 登録者情報を表示（住所、組織など）
- ネームサーバー情報を表示

**表示例:**
```
$ whois example.com

Domain Name: EXAMPLE.COM
Registry Domain ID: D123456789-AGRS
Registrar WHOIS Server: whois.example.com
Registrar URL: http://www.example.com
Updated Date: 2025-02-21
Creation Date: 2018-05-12
Registry Expiry Date: 2026-03-15
Registrar: Example Registrar, Inc.
Registrar IANA ID: 12345
Registrant Name: Domain Owner
Registrant Organization: Example Organization
Registrant Street: 123 Main Street
Registrant City: Example City
Registrant State: EX
Registrant Postal Code: 12345
Registrant Country: US
Registrant Email: admin@example.com
Name Server: ns1.example.com (210.150.180.45)
Name Server: ns2.example.com (172.16.20.105)
DNSSEC: unsigned
```

### 5. nmap - ポートスキャン
**改善内容:**
- スキャン対象のIPアドレスを表示（ランダムに生成）
- レイテンシ情報を表示（ランダム）
- 複数のポートとサービスを表示
- バージョン情報を表示（Apache, MySQL, PostgreSQL等）
- OS検出情報を表示
- スキャン完了時刻を表示
- スキャン実行時間を表示

**表示例:**
```
$ nmap example.com

Starting Nmap 7.92 at Friday, 02/21/2025 10:15:30 AM
Nmap scan report for example.com (192.168.1.45)
Host is up (0.0234s latency).
Skipping host example.com due to --exclude-hosts option.
Nmap done at Friday, 02/21/2025 10:15:35 AM; 1 IP address (1 host up) scanned in 4.53s

Port Analysis:
Not shown: 991 closed ports
PORT    STATE SERVICE VERSION
22/tcp  open  ssh     OpenSSH 7.4
80/tcp  open  http    Apache httpd 2.4.6
443/tcp open  https   Apache httpd 2.4.6 (SSL)
3306/tcp open mysql   MySQL 5.7.26
5432/tcp open postgres PostgreSQL 11.4
8080/tcp open http    Tomcat 9.0

OS Detection:
OS: Linux 3.10 - 4.8
Aggressive OS guesses: Linux 4.15-4.19, Linux 5.0
```

### 6. shodan - IoT/サーバー検索
**改善内容:**
- クエリを表示
- ランダムな検索結果数を生成（100-10000件）
- 複数の検索結果を表示（トップ3）
- 各結果にIP:ポート、組織名、OS、サービス情報を表示

**表示例:**
```
$ shodan search "Apache"

[*] Shodan API: 検索中...
[*] クエリ: "Apache"
[+] 検索結果: 4567 個のデバイスが見つかりました

Top Results:
[1] 192.168.45.123:80
    Organization: Example Corp
    OS: Linux
    Service: Apache/2.4.6

[2] 203.45.67.89:22
    Organization: Web Hosting Co
    OS: Linux (Ubuntu)
    Service: OpenSSH 7.4

[3] 172.16.20.105:3306
    Organization: Database Services
    OS: Linux
    Service: MySQL 5.7
```

## 技術的な改善点

### generateIP() メソッドの追加
```javascript
generateIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}
```
毎回異なるIPアドレスを生成することで、より現実的な出力を実現しています。

### コンテキスト認識
各コマンドが入力されたURL、ドメイン、またはホスト名をレスポンスに反映させます：
```javascript
// URLからドメインを抽出
const domain = url.replace(/https?:\/\//i, '').split('/')[0];

// レスポンスに含める
this.printOutput(`<title>${domain}</title>\n`);
```

### タイムスタンプの動的生成
```javascript
new Date().toUTCString()
new Date().toLocaleString()
```
毎回の実行時刻を反映させることで、ログの現実性を向上させています。

### ランダム性の導入
```javascript
// ランダムな登録年を生成
const createdYear = Math.floor(Math.random() * (2024 - 2005)) + 2005;

// ランダムなレイテンシを生成
(Math.random() * 0.05 + 0.001).toFixed(4)
```

## ゲームシステムへの統合

これらのコマンド改善により：
1. **ゲーム体験の向上** - より現実的な「ハッカー」体験を提供
2. **没入感の向上** - 本物のコマンドラインツールに近い動作
3. **教育的価値** - 実際のセキュリティツールの動作を学べる
4. **スコア加算** - 各コマンド実行時にスコアが加算される

## 使用例

### 例1: Webサイト情報の収集
```
$ curl https://target.com
$ dig target.com
$ whois target.com
```

### 例2: ネットワークスキャン
```
$ nmap 192.168.1.0/24
$ shodan search "nginx"
```

### 例3: ファイルダウンロード
```
$ wget https://target.com/backup.zip
```

## スコア加算

各コマンドの実行でスコアが加算されます：
- **curl**: +15点
- **wget**: +15点
- **dig**: +15点
- **whois**: +15点
- **nmap**: +25点
- **shodan**: +20点

## 今後の拡張可能性

- **実際のAPI統合**: 将来的にはShodan APIやGeoIP APIなどの統合が可能
- **キャッシング**: 同じクエリに対する結果をキャッシュすることで効率化
- **エラーハンドリング**: タイムアウトや接続失敗などの現実的なエラー表示
- **オプション対応**: -X, -H, -d などのオプションに対応した処理
- **カスタムIPレンジ**: プライベートIPレンジ（192.168.*, 10.*等）の検出と処理

## ファイル更新情報

**更新ファイル**: `game/static/game/game.js`
- **追加メソッド**: `generateIP()`
- **改善メソッド**: 
  - `cmdCURL()` - 8行 → 33行
  - `cmdWGET()` - 7行 → 20行
  - `cmdDIG()` - 7行 → 31行
  - `cmdWHOIS()` - 6行 → 27行
  - `cmdNMAP()` - 13行 → 38行
  - `cmdSHODAN()` - 5行 → 28行

**総行数増加**: 約100行
**新規実装内容**: コンテキスト認識、ランダムデータ生成、詳細な出力形式

---

**実装日時**: 2025-02-21  
**バージョン**: 2.0  
**ステータス**: ✅ 完成
