// =====================================
// ハッカータイパー - テキストアドベンチャー型
// =====================================

class TextAdventureGame {
    constructor() {
        // DOM要素
        this.commandInput = document.getElementById('commandInput');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.promptText = document.getElementById('promptText');
        this.currentUser = document.getElementById('currentUser');
        this.currentLocation = document.getElementById('currentLocation');
        
        // プロフィール要素
        this.playerNameInput = document.getElementById('playerName');
        this.playerPasswordInput = document.getElementById('playerPassword');
        this.loginBtn = document.getElementById('loginBtn');
        
        this.loginUsername = document.getElementById('loginUsername');
        this.loginPassword = document.getElementById('loginPassword');
        this.loginErrorDiv = document.getElementById('loginError');
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        this.registerUsername = document.getElementById('registerUsername');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerErrorDiv = document.getElementById('registerError');
        this.registerBtn = document.getElementById('registerBtn');
        
        this.accountStatus = document.getElementById('accountStatus');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.battleBtn = document.getElementById('battleBtn');
        this.gameContainer = document.getElementById('gameContainer');
        this.opponentOutput = document.getElementById('opponentOutput');
        
        // チャット要素
        this.chatInput = document.getElementById('chatInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.sendChatBtn = document.getElementById('sendChatBtn');
        
        // ゲーム状態
        this.currentPath = '/home';
        this.commandHistory = [];
        this.gameStarted = false;
        this.inBattle = false;
        this.score = 0;
        this.currentPlayerName = 'Hacker' + Math.floor(Math.random() * 1000);
        
        // 仮想ファイルシステム
        this.fileSystem = this.initializeFileSystem();
        
        // ウェルカムメッセージ表示
        this.showWelcomeMessage();
        
        // イベントリスナー
        this.setupEventListeners();
        
        // 前回のログイン情報を復元
        this.restoreLoginSession();
    }
    
    initializeFileSystem() {
        return {
            '/': {
                type: 'directory',
                contents: {
                    'home': { type: 'directory' },
                    'root': { type: 'directory' },
                    'etc': { type: 'directory' },
                    'var': { type: 'directory' },
                }
            },
            '/home': {
                type: 'directory',
                contents: {
                    'hacker': { type: 'directory' },
                    'README.txt': { type: 'file', content: 'ハッカーへようこそ！\nセキュリティシステムをハックして、秘密のファイルを見つけよう！' }
                }
            },
            '/home/hacker': {
                type: 'directory',
                contents: {
                    '.hidden': { type: 'file', content: '秘密のパスワード: hack123456' },
                    'secret.txt': { type: 'file', content: 'これは秘密のファイルです。\n暗号化されたデータ: a8d3k2f9j4k2l...' },
                    'document.txt': { type: 'file', content: 'ハッキング完了！おめでとうございます！' }
                }
            },
            '/root': {
                type: 'directory',
                contents: {
                    'admin.log': { type: 'file', content: 'Administrator access log\nLast login: 2026-01-17 10:00:00' },
                    'backup.zip': { type: 'file', content: '[バイナリファイル]' }
                }
            },
            '/etc': {
                type: 'directory',
                contents: {
                    'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash' },
                    'config': { type: 'file', content: '[設定ファイル]' }
                }
            },
            '/var': {
                type: 'directory',
                contents: {
                    'log': { type: 'directory' },
                    'cache': { type: 'directory' }
                }
            }
        };
    }
    
    setupEventListeners() {
        // タブ切り替え
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // プロフィール設定 - ログイン
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.loginPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        
        // ログアウトボタン
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // プロフィール設定 - 登録
        this.registerBtn.addEventListener('click', () => this.handleRegister());
        this.registerPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleRegister();
        });
        
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
        
        this.commandInput.addEventListener('focus', () => {
            this.commandInput.parentElement.style.borderColor = '#00ff00';
        });
        
        this.commandInput.addEventListener('blur', () => {
            this.commandInput.parentElement.style.borderColor = '#00ff0040';
        });
        
        // チャット機能
        this.sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // 戦うボタン
        this.battleBtn.addEventListener('click', () => {
            if (!this.currentPlayerName) {
                alert('先にログインしてください');
                return;
            }
            // プレイヤー名をlocalStorageに保存
            localStorage.setItem('playerName', this.currentPlayerName);
            window.location.href = '/battle/';
        });
        
        // チャットメッセージを定期的に取得
        this.chatUpdateInterval = setInterval(() => this.loadChatMessages(), 2000);
    }
    
    sendChatMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // CSRFトークンを取得
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        // サーバーにメッセージを送信
        fetch('/api/send-chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                message: message,
                player_name: this.currentPlayerName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // ユーザーのメッセージを表示
                const userMsg = document.createElement('div');
                userMsg.className = 'chat-message user';
                userMsg.innerHTML = `<strong>${data.message_data.player_name}:</strong> ${data.message_data.message}`;
                this.chatMessages.appendChild(userMsg);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        })
        .catch(err => console.error('チャット送信エラー:', err));
        
        // クリア
        this.chatInput.value = '';
    }
    
    loadChatMessages() {
        fetch('/api/get-chat/?limit=50')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.messages.length > 0) {
                    // 最新メッセージのみを表示
                    const lastMessageTime = this.lastChatTime || 0;
                    const newMessages = data.messages.filter(msg => {
                        return new Date(msg.timestamp).getTime() > lastMessageTime;
                    });
                    
                    newMessages.forEach(msg => {
                        const msgDiv = document.createElement('div');
                        msgDiv.className = 'chat-message';
                        msgDiv.innerHTML = `<strong>${msg.player_name}:</strong> ${msg.message}`;
                        this.chatMessages.appendChild(msgDiv);
                    });
                    
                    if (newMessages.length > 0) {
                        this.lastChatTime = new Date(data.messages[data.messages.length - 1].timestamp).getTime();
                        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
                    }
                }
            })
            .catch(err => console.error('チャット読み込みエラー:', err));
    }
    
    showWelcomeMessage() {
        const welcome = `
╔═══════════════════════════════════════════════════╗
║     web hack                                      ║
║     制作者:kazuma masuda                          ║
╚═══════════════════════════════════════════════════╝

hack web

        `;
        this.printOutput(welcome);
        this.gameStarted = true;
        this.commandInput.focus();
    }
    
    handleLogin() {
        const name = this.playerNameInput.value.trim();
        const password = this.playerPasswordInput.value.trim();
        
        if (!name) {
            alert('ハッカー名を入力してください');
            return;
        }
        
        if (!password) {
            alert('パスワードを入力してください');
            return;
        }
        
        // プレイヤー情報を保存
        this.currentPlayerName = name;
        
        // UI更新
        this.playerNameInput.disabled = true;
        this.playerPasswordInput.disabled = true;
        this.loginBtn.disabled = true;
        this.loginBtn.textContent = '✓ ログイン済み';
        this.loginBtn.style.background = '#00ff0040';
        
        // ターミナルにメッセージを出力
        this.printOutput(`\n[${name}] としてログインしました\n`);
    }
    
    switchTab(tabName) {
        // 全タブを非表示に
        this.tabContents.forEach(content => content.classList.remove('active'));
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        
        // 選択されたタブを表示
        document.getElementById(tabName + '-tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
    
    handleLogin() {
        const username = this.loginUsername.value.trim();
        const password = this.loginPassword.value.trim();
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        if (!username || !password) {
            this.loginErrorDiv.textContent = 'ユーザー名とパスワードを入力してください';
            return;
        }
        
        // サーバーにログイン要求
        fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.currentPlayerName = username;
                
                // クッキーとローカルストレージに保存（30日間有効）
                this.setLoginCookie(username, password);
                localStorage.setItem('playerName', username);
                localStorage.setItem('playerPassword', password);
                localStorage.setItem('lastLoginTime', new Date().toISOString());
                
                this.loginUsername.disabled = true;
                this.loginPassword.disabled = true;
                this.loginBtn.style.display = 'none';
                this.logoutBtn.style.display = 'block';
                this.loginErrorDiv.textContent = '';
                this.accountStatus.textContent = `✓ ${username} としてログイン中`;
                this.printOutput(`\n[${username}] としてログインしました\n`);
            } else {
                this.loginErrorDiv.textContent = data.message;
            }
        })
        .catch(err => {
            console.error('ログインエラー:', err);
            this.loginErrorDiv.textContent = 'ログインに失敗しました';
        });
    }
    
    // クッキーを設定（30日間有効）
    setLoginCookie(username, password) {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30日後
        const expires = 'expires=' + expirationDate.toUTCString();
        
        // ユーザー名とパスワードをクッキーに保存（本番環境ではトークン方式推奨）
        document.cookie = `playerName=${encodeURIComponent(username)}; ${expires}; path=/`;
        document.cookie = `playerPassword=${encodeURIComponent(password)}; ${expires}; path=/`;
    }
    
    // クッキーから値を取得
    getCookie(name) {
        const nameEQ = name + '=';
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }
    
    // ページ読み込み時に前回のログイン情報を復元
    restoreLoginSession() {
        // クッキーまたはローカルストレージからログイン情報を取得
        const savedUsername = this.getCookie('playerName') || localStorage.getItem('playerName');
        const savedPassword = this.getCookie('playerPassword') || localStorage.getItem('playerPassword');
        
        if (savedUsername && savedPassword) {
            this.loginUsername.value = savedUsername;
            this.loginPassword.value = savedPassword;
            // 自動的にログイン
            setTimeout(() => {
                this.handleLogin();
            }, 100);
        }
    }
    
    // ログアウト処理
    handleLogout() {
        // クッキーを削除
        this.deleteCookie('playerName');
        this.deleteCookie('playerPassword');
        
        // ローカルストレージを削除
        localStorage.removeItem('playerName');
        localStorage.removeItem('playerPassword');
        localStorage.removeItem('lastLoginTime');
        
        // UI状態をリセット
        this.currentPlayerName = 'Hacker' + Math.floor(Math.random() * 1000);
        this.loginUsername.value = '';
        this.loginPassword.value = '';
        this.loginUsername.disabled = false;
        this.loginPassword.disabled = false;
        this.loginBtn.style.display = 'block';
        this.logoutBtn.style.display = 'none';
        this.loginErrorDiv.textContent = '';
        this.accountStatus.textContent = '';
        
        this.printOutput('\nログアウトしました\n');
        this.loginUsername.focus();
    }
    
    // クッキーを削除
    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    
    handleRegister() {
        const username = this.registerUsername.value.trim();
        const password = this.registerPassword.value.trim();
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        if (!username || !password) {
            this.registerErrorDiv.textContent = 'ユーザー名とパスワードを入力してください';
            return;
        }
        
        if (password.length < 3) {
            this.registerErrorDiv.textContent = 'パスワードは3文字以上で入力してください';
            return;
        }
        
        // サーバーに登録要求
        fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.registerErrorDiv.textContent = '';
                this.registerUsername.value = '';
                this.registerPassword.value = '';
                this.accountStatus.textContent = `✓ アカウントを作成しました`;
                this.switchTab('login');
                this.loginUsername.value = username;
                this.loginPassword.focus();
            } else {
                this.registerErrorDiv.textContent = data.message;
            }
        })
        .catch(err => {
            console.error('登録エラー:', err);
            this.registerErrorDiv.textContent = '登録に失敗しました';
        });
    }
    
    executeCommand() {
        const input = this.commandInput.value.trim();
        
        if (!input) {
            this.commandInput.value = '';
            return;
        }
        
        // コマンドを表示
        this.printPrompt(input);
        this.commandHistory.push(input);
        
        // コマンド解析
        const [cmd, ...args] = input.split(' ');
        const command = cmd.toLowerCase();
        
        // コマンド実行
        switch (command) {
            case 'ls':
                this.cmdLS(args.join(' '));
                break;
            case 'cat':
                this.cmdCAT(args.join(' '));
                break;
            case 'pwd':
                this.cmdPWD();
                break;
            case 'cd':
                this.cmdCD(args.join(' '));
                break;
            case 'help':
                this.cmdHELP();
                break;
            case 'clear':
                this.terminalOutput.innerHTML = '';
                break;
            case 'find':
                this.cmdFIND(args.join(' '));
                break;
            case 'grep':
                this.cmdGREP(args);
                break;
            case 'oput':
                this.cmdOPUT(args.join(' '));
                break;
            case 'whoami':
                this.printOutput('root\n');
                this.score += 5;
                break;
            case 'date':
                this.printOutput('2026年1月17日 10:19:16 JST\n');
                break;
            case 'echo':
                this.printOutput(args.join(' ') + '\n');
                break;
            default:
                this.printOutput(`コマンド '${command}' が見つかりません\n`);
        }
        
        // 入力フィールドクリア
        this.commandInput.value = '';
    }
    
    cmdLS(path) {
        const targetPath = this.resolvePath(path || this.currentPath);
        const dir = this.getDirectory(targetPath);
        
        if (!dir) {
            this.printOutput(`ls: '${path}': そのようなファイルまたはディレクトリはありません\n`);
            return;
        }
        
        if (dir.type !== 'directory') {
            this.printOutput(`ls: '${path}': ディレクトリではありません\n`);
            return;
        }
        
        let output = '';
        for (const [name, item] of Object.entries(dir.contents || {})) {
            const icon = item.type === 'directory' ? '📁' : '📄';
            output += `${icon} ${name}\n`;
        }
        
        this.printOutput(output);
        this.score += 10;
    }
    
    cmdCAT(filePath) {
        if (!filePath) {
            this.printOutput('使用法: cat <ファイルパス>\n');
            return;
        }
        
        const targetPath = this.resolvePath(filePath);
        const file = this.getFile(targetPath);
        
        if (!file) {
            this.printOutput(`cat: '${filePath}': そのようなファイルまたはディレクトリはありません\n`);
            return;
        }
        
        if (file.type !== 'file') {
            this.printOutput(`cat: '${filePath}': ファイルではありません\n`);
            return;
        }
        
        this.printOutput(file.content + '\n');
        this.score += 20;
        
        // 秘密のファイルを見つけたらボーナス
        if (filePath.includes('secret') || filePath.includes('.hidden')) {
            this.printOutput('\n🎉 秘密のファイルを発見しました！ (+100 points)\n');
            this.score += 100;
        }
    }
    
    cmdPWD() {
        this.printOutput(this.currentPath + '\n');
        this.score += 5;
    }
    
    cmdCD(path) {
        if (!path) {
            this.currentPath = '/home';
            this.updatePrompt();
            return;
        }
        
        const targetPath = this.resolvePath(path);
        const dir = this.getDirectory(targetPath);
        
        if (!dir) {
            this.printOutput(`cd: '${path}': そのようなファイルまたはディレクトリはありません\n`);
            return;
        }
        
        if (dir.type !== 'directory') {
            this.printOutput(`cd: '${path}': ディレクトリではありません\n`);
            return;
        }
        
        this.currentPath = targetPath;
        this.updatePrompt();
        this.score += 10;
    }
    
    cmdHELP() {
        const help = `
使用可能なコマンド:
  ls
  cat
  pwd
  cd
  help
        `;
        this.printOutput(help + '\n');
    }
    
    cmdFIND(name) {
        if (!name) {
            this.printOutput('使用法: find <名前>\n');
            return;
        }
        
        let results = [];
        this.searchFiles(this.fileSystem, '/', name, results);
        
        if (results.length === 0) {
            this.printOutput(`find: '${name}' が見つかりません\n`);
        } else {
            this.printOutput(results.join('\n') + '\n');
        }
        
        this.score += 15;
    }
    
    cmdGREP(args) {
        if (args.length < 2) {
            this.printOutput('使用法: grep <パターン> <ファイル>\n');
            return;
        }
        
        const pattern = args[0];
        const filePath = args[1];
        const file = this.getFile(this.resolvePath(filePath));
        
        if (!file) {
            this.printOutput(`grep: '${filePath}': そのようなファイルまたはディレクトリはありません\n`);
            return;
        }
        
        const lines = file.content.split('\n');
        const results = lines.filter(line => line.includes(pattern));
        
        if (results.length === 0) {
            this.printOutput('');
        } else {
            this.printOutput(results.join('\n') + '\n');
        }
        
        this.score += 15;
    }
    
    cmdOPUT(text) {
        if (!text) {
            this.printOutput('使用法: oput <テキスト>\n');
            return;
        }
        
        // ハッキング風の演出を表示
        this.printOutput('🔓 セキュリティシステム侵入中...\n');
        
        // ハッキング風の複数行テキスト
        const hackingSequence = [
            '[*] ファイアウォール解析中...',
            '[+] パスワードハッシュを抽出',
            '[+] 暗号化キー発見: 0x7f8a2c9d',
            '[*] ネットワーク通信傍受中...',
            '[+] 認証トークン取得: success',
            '[*] データベース接続確立...',
            '[+] root権限取得完了',
            '[*] ファイルシステムマウント...',
            '[+] 機密ファイル列挙開始',
            '[*] バックドア設置中...',
            '[+] リモートアクセス確立',
            '[*] ログ改ざん実行中...',
            '[+] トレース削除完了',
        ];
        
        // ハッキング演出を表示
        for (const line of hackingSequence) {
            this.printOutput(line);
        }
        
        this.printOutput('\n[SUCCESS] ハッキング完了！\n');
        this.printOutput(`[OUTPUT] ${text}\n`);
        this.printOutput('\n✓ システム制御権獲得\n');
        
        this.score += 50;
    }
    
    searchFiles(fs, path, name, results) {
        const pathObj = this.getDirectory(path);
        if (!pathObj || !pathObj.contents) return;
        
        for (const [itemName, item] of Object.entries(pathObj.contents)) {
            const fullPath = path === '/' ? `/${itemName}` : `${path}/${itemName}`;
            
            if (itemName.includes(name)) {
                results.push(fullPath);
            }
            
            if (item.type === 'directory') {
                this.searchFiles(fs, fullPath, name, results);
            }
        }
    }
    
    resolvePath(path) {
        if (!path) return this.currentPath;
        if (path.startsWith('/')) return path;
        if (path === '..') {
            const parts = this.currentPath.split('/').filter(p => p);
            parts.pop();
            return parts.length === 0 ? '/' : '/' + parts.join('/');
        }
        if (path === '.') return this.currentPath;
        
        return this.currentPath === '/' 
            ? '/' + path 
            : this.currentPath + '/' + path;
    }
    
    getDirectory(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem['/'];
        
        if (path === '/') return current;
        
        for (const part of parts) {
            if (!current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current;
    }
    
    getFile(path) {
        const parts = path.split('/').filter(p => p);
        const fileName = parts.pop();
        
        const dir = this.getDirectory('/' + parts.join('/'));
        if (!dir || !dir.contents || !dir.contents[fileName]) {
            return null;
        }
        
        return dir.contents[fileName];
    }
    
    printPrompt(input) {
        const promptEl = document.createElement('div');
        promptEl.className = 'output-line command-line';
        promptEl.innerHTML = `<span class="prompt-text">${this.currentUser.textContent}:${this.currentLocation.textContent}$</span> <span class="user-command">${this.escapeHtml(input)}</span>`;
        this.terminalOutput.appendChild(promptEl);
        this.scrollToBottom();
    }
    
    printOutput(text) {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line === '') continue;
            
            const outputEl = document.createElement('div');
            outputEl.className = 'output-line';
            outputEl.innerHTML = this.escapeHtml(line);
            this.terminalOutput.appendChild(outputEl);
        }
        this.scrollToBottom();
    }
    
    updatePrompt() {
        const displayPath = this.currentPath === '/home' ? '~' : this.currentPath;
        this.currentLocation.textContent = displayPath;
        this.promptText.textContent = `root@hacker:${displayPath}$`;
    }
    
    scrollToBottom() {
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ページ読み込み時にゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    new TextAdventureGame();
});

