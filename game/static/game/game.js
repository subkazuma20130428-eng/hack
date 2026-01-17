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
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion();
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
            case 'mkdir':
                this.cmdMKDIR(args.join(' '));
                break;
            case 'rm':
                this.cmdRM(args.join(' '));
                break;
            case 'mv':
                this.cmdMV(args);
                break;
            case 'cp':
                this.cmdCP(args);
                break;
            case 'touch':
                this.cmdTOUCH(args.join(' '));
                break;
            case 'nano':
                this.cmdNANO(args.join(' '));
                break;
            case 'chmod':
                this.cmdCHMOD(args);
                break;
            case 'ls -la':
            case 'ls -a':
            case 'ls -l':
                this.cmdLSDetailed(args.join(' '));
                break;
            case 'history':
                this.cmdHISTORY();
                break;
            case 'ps':
                this.cmdPS();
                break;
            case 'top':
                this.cmdTOP();
                break;
            case 'netstat':
                this.cmdNETSTAT();
                break;
            case 'ifconfig':
                this.cmdIFCONFIG();
                break;
            case 'ping':
                this.cmdPING(args.join(' '));
                break;
            case 'tracert':
            case 'traceroute':
                this.cmdTRACEROUTE(args.join(' '));
                break;
            case 'ssh':
                this.cmdSSH(args.join(' '));
                break;
            case 'telnet':
                this.cmdTELNET(args.join(' '));
                break;
            case 'nmap':
                this.cmdNMAP(args.join(' '));
                break;
            case 'whoami':
                this.printOutput('root\n');
                this.score += 5;
                break;
            case 'uname':
                this.cmdUNAME();
                break;
            case 'man':
                this.cmdMAN(args.join(' '));
                break;
            case 'file':
                this.cmdFILE(args.join(' '));
                break;
            case 'head':
                this.cmdHEAD(args);
                break;
            case 'tail':
                this.cmdTAIL(args);
                break;
            case 'wc':
                this.cmdWC(args);
                break;
            case 'sort':
                this.cmdSORT(args.join(' '));
                break;
            case 'uniq':
                this.cmdUNIQ(args.join(' '));
                break;
            case 'diff':
                this.cmdDIFF(args);
                break;
            case 'hex':
            case 'hexdump':
                this.cmdHEX(args.join(' '));
                break;
            case 'base64':
                this.cmdBASE64(args);
                break;
            case 'md5sum':
            case 'sha256sum':
                this.cmdHASH(args.join(' '));
                break;
            case 'curl':
                this.cmdCURL(args.join(' '));
                break;
            case 'wget':
                this.cmdWGET(args.join(' '));
                break;
            case 'ftp':
                this.cmdFTP(args.join(' '));
                break;
            case 'arp':
                this.cmdARP();
                break;
            case 'ipconfig':
                this.cmdIPCONFIG();
                break;
            case 'systeminfo':
                this.cmdSYSTEMINFO();
                break;
            case 'tasklist':
            case 'taskkill':
                this.cmdTASKLIST();
                break;
            case 'whoami':
                this.cmdWHOAMI();
                break;
            case 'id':
                this.cmdID();
                break;
            case 'groups':
                this.cmdGROUPS();
                break;
            case 'sudo':
                this.cmdSUDO(args.join(' '));
                break;
            case 'exit':
                this.cmdEXIT();
                break;
            case 'shutdown':
                this.cmdSHUTDOWN(args.join(' '));
                break;
            case 'reboot':
                this.cmdREBOOT();
                break;
            case 'alias':
                this.cmdALIAS(args);
                break;
            case 'which':
                this.cmdWHICH(args.join(' '));
                break;
            case 'env':
                this.cmdENV();
                break;
            case 'export':
                this.cmdEXPORT(args.join(' '));
                break;
            case 'unset':
                this.cmdUNSET(args.join(' '));
                break;
            case 'source':
                this.cmdSOURCE(args.join(' '));
                break;
            case 'mount':
                this.cmdMOUNT();
                break;
            case 'umount':
                this.cmdUMOUNT(args.join(' '));
                break;
            case 'df':
                this.cmdDF();
                break;
            case 'du':
                this.cmdDU(args.join(' '));
                break;
            case 'free':
                this.cmdFREE();
                break;
            case 'apt':
                this.cmdAPT(args);
                break;
            case 'yum':
                this.cmdYUM(args);
                break;
            case 'pacman':
                this.cmdPACMAN(args);
                break;
            case 'git':
                this.cmdGIT(args);
                break;
            case 'docker':
                this.cmdDOCKER(args);
                break;
            case 'python':
            case 'python3':
                this.cmdPYTHON(args);
                break;
            case 'node':
                this.cmdNODE(args);
                break;
            case 'gcc':
                this.cmdGCC(args);
                break;
            case 'make':
                this.cmdMAKE();
                break;
            case 'sed':
                this.cmdSED(args);
                break;
            case 'awk':
                this.cmdAWK(args);
                break;
            case 'tr':
                this.cmdTR(args);
                break;
            case 'cut':
                this.cmdCUT(args);
                break;
            case 'paste':
                this.cmdPASTE(args);
                break;
            case 'xargs':
                this.cmdXARGS(args);
                break;
            case 'tee':
                this.cmdTEE(args);
                break;
            case 'less':
                this.cmdLESS(args.join(' '));
                break;
            case 'more':
                this.cmdMORE(args.join(' '));
                break;
            case 'strings':
                this.cmdSTRINGS(args.join(' '));
                break;
            case 'objdump':
                this.cmdOBJDUMP(args.join(' '));
                break;
            case 'readelf':
                this.cmdREADELF(args.join(' '));
                break;
            case 'strace':
                this.cmdSTRACE(args.join(' '));
                break;
            case 'ltrace':
                this.cmdLTRACE(args.join(' '));
                break;
            case 'disassemble':
                this.cmdDISASSEMBLE(args.join(' '));
                break;
            case 'sqlmap':
                this.cmdSQLMAP(args.join(' '));
                break;
            case 'hydra':
                this.cmdHYDRA(args.join(' '));
                break;
            case 'aircrack-ng':
                this.cmdAIRCRACK(args.join(' '));
                break;
            case 'wireshark':
                this.cmdWIRESHARK(args.join(' '));
                break;
            case 'metasploit':
            case 'msfconsole':
                this.cmdMETASPLOIT(args.join(' '));
                break;
            case 'burp':
                this.cmdBURP();
                break;
            case 'nessus':
                this.cmdNESSUS();
                break;
            case 'shodan':
                this.cmdSHODAN(args.join(' '));
                break;
            case 'whois':
                this.cmdWHOIS(args.join(' '));
                break;
            case 'dig':
            case 'nslookup':
                this.cmdDIG(args.join(' '));
                break;
            case 'reverse-shell':
                this.cmdREVERSESHELL(args.join(' '));
                break;
            case 'payload':
                this.cmdPAYLOAD();
                break;
            case 'exploit':
                this.cmdEXPLOIT(args.join(' '));
                break;
            case 'crack':
                this.cmdCRACK(args.join(' '));
                break;
            case 'john':
                this.cmdJOHN(args.join(' '));
                break;
            case 'hashcat':
                this.cmdHASHCAT(args.join(' '));
                break;
            case 'openssl':
                this.cmdOPENSSL(args);
                break;
            case 'gpg':
                this.cmdGPG(args);
                break;
            case 'steghide':
                this.cmdSTEGHIDE(args);
                break;
            case 'phantom':
                this.cmdPHANTOM(args);
                break;
            case 'hacker':
                this.cmdHACKER(args.join(' '));
                break;
            case 'hack':
                this.cmdHACK();
                break;
            case 'system':
            case 'exec':
            case 'shell':
                this.cmdSYSTEM(args.join(' '));
                break;
            case 'ifstat':
                this.cmdIFSTAT();
                break;
            case 'lsof':
                this.cmdLSOF();
                break;
            case 'chmod':
                this.cmdCHMOD(args);
                break;
            case 'chown':
                this.cmdCHOWN(args);
                break;
            case 'useradd':
                this.cmdUSERADD(args.join(' '));
                break;
            case 'userdel':
                this.cmdUSERDEL(args.join(' '));
                break;
            case 'passwd':
                this.cmdPASSWD(args.join(' '));
                break;
            case 'su':
                this.cmdSU(args.join(' '));
                break;
            case 'sudo':
                this.cmdSUDO(args.join(' '));
                break;
            case 'visudo':
                this.cmdVISUDO();
                break;
            case 'crontab':
                this.cmdCRONTAB(args);
                break;
            case 'at':
                this.cmdAT(args);
                break;
            case 'systemctl':
                this.cmdSYSTEMCTL(args);
                break;
            case 'service':
                this.cmdSERVICE(args);
                break;
            case 'journalctl':
                this.cmdJOURNALCTL(args);
                break;
            case 'syslog':
                this.cmdSYSLOG();
                break;
            case 'logrotate':
                this.cmdLOGROTATE();
                break;
            case 'dmesg':
                this.cmdDMESG();
                break;
            case 'uptime':
                this.cmdUPTIME();
                break;
            case 'w':
                this.cmdW();
                break;
            case 'finger':
                this.cmdFINGER(args.join(' '));
                break;
            case 'last':
                this.cmdLAST();
                break;
            case 'lastlog':
                this.cmdLASTLOG();
                break;
            case 'who':
                this.cmdWHO();
                break;
            case 'getent':
                this.cmdGETENT(args);
                break;
            case 'hostname':
                this.cmdHOSTNAME(args.join(' '));
                break;
            case 'domainname':
                this.cmdDOMAINNAME();
                break;
            case 'timedatectl':
                this.cmdTIMEDATECTL(args);
                break;
            case 'hwclock':
                this.cmdHWCLOCK();
                break;
            case 'lscpu':
                this.cmdLSCPU();
                break;
            case 'lsblk':
                this.cmdLSBLK();
                break;
            case 'lspci':
                this.cmdLSPCI();
                break;
            case 'lsusb':
                this.cmdLSUSB();
                break;
            case 'inxi':
                this.cmdINXI();
                break;
            case 'neofetch':
            case 'screenfetch':
                this.cmdNEOFETCH();
                break;
            case 'poweroff':
                this.cmdPOWEROFF();
                break;
            case 'halt':
                this.cmdHALT();
                break;
            case 'sync':
                this.cmdSYNC();
                break;
            case 'swapoff':
            case 'swapon':
                this.cmdSWAP(args.join(' '));
                break;
            case 'mkswap':
                this.cmdMKSWAP(args.join(' '));
                break;
            case 'fdisk':
                this.cmdFDISK(args.join(' '));
                break;
            case 'parted':
                this.cmdPARTED(args.join(' '));
                break;
            case 'mkfs':
                this.cmdMKFS(args.join(' '));
                break;
            case 'fsck':
                this.cmdFSCK(args.join(' '));
                break;
            case 'tune2fs':
                this.cmdTUNE2FS();
                break;
            case 'blkid':
                this.cmdBLKID();
                break;
            case 'badblocks':
                this.cmdBADBLOCKS(args.join(' '));
                break;
            case 'smartctl':
                this.cmdSMARTCTL(args);
                break;
            case 'raid':
                this.cmdRAID(args);
                break;
            case 'lvm':
                this.cmdLVM(args);
                break;
            case 'pvcreate':
                this.cmdPVCREATE();
                break;
            case 'vgcreate':
                this.cmdVGCREATE();
                break;
            case 'lvcreate':
                this.cmdLVCREATE();
                break;
            case 'lvextend':
                this.cmdLVEXTEND();
                break;
            case 'lvreduce':
                this.cmdLVREDUCE();
                break;
            case 'tar':
                this.cmdTAR(args);
                break;
            case 'gzip':
            case 'gunzip':
                this.cmdGZIP(args);
                break;
            case 'bzip2':
                this.cmdBZIP2(args);
                break;
            case 'xz':
                this.cmdXZ(args);
                break;
            case 'zip':
            case 'unzip':
                this.cmdZIP(args);
                break;
            case 'rar':
                this.cmdRAR(args);
                break;
            case 'ar':
                this.cmdAR(args);
                break;
            case '7z':
                this.cmd7Z(args);
                break;
            case 'cpio':
                this.cmdCPIO(args);
                break;
            case 'dd':
                this.cmdDD(args);
                break;
            case 'rsync':
                this.cmdRSYNC(args);
                break;
            case 'scp':
                this.cmdSCP(args);
                break;
            case 'sftp':
                this.cmdSFTP(args.join(' '));
                break;
            case 'sshpass':
                this.cmdSSHPASS(args);
                break;
            case 'ssh-keygen':
                this.cmdSSHKEYGEN(args);
                break;
            case 'ssh-copy-id':
                this.cmdSSHCOPYID(args.join(' '));
                break;
            case 'ssh-agent':
                this.cmdSSHAGENT();
                break;
            case 'ssh-add':
                this.cmdSSHADD(args);
                break;
            case 'sshfs':
                this.cmdSSHFS(args.join(' '));
                break;
            case 'autossh':
                this.cmdAUTOSSH(args.join(' '));
                break;
            case 'proxychains':
                this.cmdPROXYCHAINS(args);
                break;
            case 'tor':
                this.cmdTOR();
                break;
            case 'torsocks':
                this.cmdTORSOCKS(args);
                break;
            case 'openvpn':
                this.cmdOPENVPN(args);
                break;
            case 'vpnc':
                this.cmdVPNC(args);
                break;
            case 'wireguard':
            case 'wg':
                this.cmdWIREGUARD(args);
                break;
            case 'zerotier':
                this.cmdZEROTIER(args);
                break;
            case 'stunnel':
                this.cmdSTUNNEL(args);
                break;
            case 'socat':
                this.cmdSOCAT(args);
                break;
            case 'nc':
            case 'ncat':
            case 'netcat':
                this.cmdNETCAT(args);
                break;
            case 'telnet':
                this.cmdTELNET(args.join(' '));
                break;
            case 'wget':
                this.cmdWGET(args.join(' '));
                break;
            case 'curl':
                this.cmdCURL(args.join(' '));
                break;
            case 'axel':
                this.cmdAXEL(args);
                break;
            case 'aria2c':
                this.cmdARIA2(args);
                break;
            case 'youtube-dl':
                this.cmdYOUTUBEDL(args);
                break;
            case 'ffmpeg':
                this.cmdFFMPEG(args);
                break;
            case 'ffprobe':
                this.cmdFFPROBE(args);
                break;
            case 'imagemagick':
            case 'convert':
                this.cmdCONVERT(args);
                break;
            case 'xclip':
                this.cmdXCLIP(args);
                break;
            case 'xsel':
                this.cmdXSEL(args);
                break;
            case 'screen':
                this.cmdSCREEN(args);
                break;
            case 'tmux':
                this.cmdTMUX(args);
                break;
            case 'script':
                this.cmdSCRIPT(args);
                break;
            case 'expect':
                this.cmdEXPECT(args);
                break;
            case 'perl':
                this.cmdPERL(args);
                break;
            case 'ruby':
                this.cmdRUBY(args);
                break;
            case 'lua':
                this.cmdLUA(args);
                break;
            case 'php':
                this.cmdPHP(args);
                break;
            case 'java':
                this.cmdJAVA(args);
                break;
            case 'javac':
                this.cmdJAVAC(args);
                break;
            case 'scala':
                this.cmdSCALA(args);
                break;
            case 'go':
                this.cmdGO(args);
                break;
            case 'rust':
            case 'rustc':
                this.cmdRUST(args);
                break;
            case 'cargo':
                this.cmdCARGO(args);
                break;
            case 'swift':
                this.cmdSWIFT(args);
                break;
            case 'kotlin':
                this.cmdKOTLIN(args);
                break;
            case 'gradle':
                this.cmdGRADLE(args);
                break;
            case 'maven':
            case 'mvn':
                this.cmdMAVEN(args);
                break;
            case 'sbt':
                this.cmdSBT(args);
                break;
            case 'npm':
                this.cmdNPM(args);
                break;
            case 'yarn':
                this.cmdYARN(args);
                break;
            case 'pnpm':
                this.cmdPNPM(args);
                break;
            case 'pip':
                this.cmdPIP(args);
                break;
            case 'pipenv':
                this.cmdPIPENV(args);
                break;
            case 'poetry':
                this.cmdPOETRY(args);
                break;
            case 'conda':
                this.cmdCONDA(args);
                break;
            case 'mamba':
                this.cmdMAMBA(args);
                break;
            case 'virtualenv':
                this.cmdVIRTUALENV(args);
                break;
            case 'venv':
                this.cmdVENV(args);
                break;
            case 'rvm':
                this.cmdRVM(args);
                break;
            case 'nvm':
                this.cmdNVM(args);
                break;
            case 'gvm':
                this.cmdGVM(args);
                break;
            case 'jenv':
                this.cmdJENV(args);
                break;
            case 'pyenv':
                this.cmdPYENV(args);
                break;
            case 'rbenv':
                this.cmdRBENV(args);
                break;
            case 'plenv':
                this.cmdPLENV(args);
                break;
            case 'ndenv':
                this.cmdNDENV(args);
                break;
            case 'direnv':
                this.cmdDIRENV(args);
                break;
            case 'asdf':
                this.cmdASDEF(args);
                break;
            case 'guix':
                this.cmdGUIX(args);
                break;
            case 'nix':
            case 'nixpkgs':
                this.cmdNIX(args);
                break;
            case 'flatpak':
                this.cmdFLATPAK(args);
                break;
            case 'snap':
                this.cmdSNAP(args);
                break;
            case 'appimage':
                this.cmdAPPIMAGE(args);
                break;
            case 'bazel':
                this.cmdBAZEL(args);
                break;
            case 'cmake':
                this.cmdCMAKE(args);
                break;
            case 'meson':
                this.cmdMESON(args);
                break;
            case 'waf':
                this.cmdWAF(args);
                break;
            case 'scons':
                this.cmdSCONS(args);
                break;
            case 'ant':
                this.cmdANT(args);
                break;
            case 'ninja':
                this.cmdNINJA(args);
                break;
            case 'tup':
                this.cmdTUP(args);
                break;
            case 'redo':
                this.cmdREDO(args);
                break;
            case 'shake':
                this.cmdSHAKE(args);
                break;
            case 'fabric':
                this.cmdFABRIC(args);
                break;
            case 'invoke':
                this.cmdINVOKE(args);
                break;
            case 'rake':
                this.cmdRAKE(args);
                break;
            case 'gulp':
                this.cmdGULP(args);
                break;
            case 'grunt':
                this.cmdGRUNT(args);
                break;
            case 'webpack':
                this.cmdWEBPACK(args);
                break;
            case 'parcel':
                this.cmdPARCEL(args);
                break;
            case 'vite':
                this.cmdVITE(args);
                break;
            case 'rollup':
                this.cmdROLLUP(args);
                break;
            case 'esbuild':
                this.cmdESBUILD(args);
                break;
            case 'swc':
                this.cmdSWC(args);
                break;
            case 'esprima':
                this.cmdESPRIMA(args);
                break;
            case 'babel':
                this.cmdBABEL(args);
                break;
            case 'typescript':
            case 'tsc':
                this.cmdTYPESCRIPT(args);
                break;
            case 'deno':
                this.cmdDENO(args);
                break;
            case 'bun':
                this.cmdBUN(args);
                break;
            case 'wasm':
            case 'wasmtime':
                this.cmdWASM(args);
                break;
            case 'lldb':
            case 'gdb':
                this.cmdDEBUGGER(args);
                break;
            case 'valgrind':
                this.cmdVALGRIND(args);
                break;
            case 'perf':
                this.cmdPERF(args);
                break;
            case 'oprofile':
                this.cmdOPROFILE(args);
                break;
            case 'gcov':
                this.cmdGCOV(args);
                break;
            case 'lcov':
                this.cmdLCOV(args);
                break;
            case 'cppcheck':
                this.cmdCPPCHECK(args);
                break;
            case 'clang':
            case 'clang-tidy':
                this.cmdCLANG(args);
                break;
            case 'tslint':
                this.cmdTSLINT(args);
                break;
            case 'eslint':
                this.cmdESLINT(args);
                break;
            case 'pylint':
                this.cmdPYLINT(args);
                break;
            case 'mypy':
                this.cmdMYPY(args);
                break;
            case 'black':
                this.cmdBLACK(args);
                break;
            case 'flake8':
                this.cmdFLAKE8(args);
                break;
            case 'autopep8':
                this.cmdAUTOPEP8(args);
                break;
            case 'isort':
                this.cmdISSORT(args);
                break;
            case 'prettier':
                this.cmdPRETTIER(args);
                break;
            case 'shellcheck':
                this.cmdSHELLCHECK(args);
                break;
            case 'shfmt':
                this.cmdSHFMT(args);
                break;
            case 'yamllint':
                this.cmdYAMLLINT(args);
                break;
            case 'jsonlint':
                this.cmdJSONLINT(args);
                break;
            case 'xmllint':
                this.cmdXMLLINT(args);
                break;
            case 'jq':
                this.cmdJQ(args);
                break;
            case 'yq':
                this.cmdYQ(args);
                break;
            case 'toml':
                this.cmdTOML(args);
                break;
            case 'protoc':
                this.cmdPROTOC(args);
                break;
            case 'graphql':
                this.cmdGRAPHQL(args);
                break;
            case 'sql':
            case 'sqlite3':
                this.cmdSQL(args);
                break;
            case 'mysql':
                this.cmdMYSQL(args);
                break;
            case 'psql':
                this.cmdPSQL(args);
                break;
            case 'mongodb':
            case 'mongo':
                this.cmdMONGODB(args);
                break;
            case 'redis-cli':
                this.cmdREDIS(args);
                break;
            case 'cassandra':
                this.cmdCASSANDRA(args);
                break;
            case 'elasticsearch':
                this.cmdELASTICSEARCH(args);
                break;
            case 'influx':
                this.cmdINFLUX(args);
                break;
            case 'prometheus':
                this.cmdPROMETHEUS(args);
                break;
            case 'graphite':
                this.cmdGRAPHITE(args);
                break;
            case 'zabbix':
                this.cmdZABBIX(args);
                break;
            case 'nagios':
                this.cmdNAGIOS(args);
                break;
            case 'icinga':
                this.cmdICINGA(args);
                break;
            case 'sensu':
                this.cmdSENSU(args);
                break;
            case 'datadog':
                this.cmdDATADOG(args);
                break;
            case 'newrelic':
                this.cmdNEWRELIC(args);
                break;
            case 'splunk':
                this.cmdSPLUNK(args);
                break;
            case 'sumo':
                this.cmdSUMO(args);
                break;
            case 'logz':
                this.cmdLOGZ(args);
                break;
            case 'papertrail':
                this.cmdPAPERTRAIL(args);
                break;
            case 'databus':
                this.cmdDATABUS(args);
                break;
            case 'kafka':
                this.cmdKAFKA(args);
                break;
            case 'rabbitmq':
                this.cmdRABBITMQ(args);
                break;
            case 'activemq':
                this.cmdACTIVEMQ(args);
                break;
            case 'nats':
                this.cmdNATS(args);
                break;
            case 'mqtt':
                this.cmdMQTT(args);
                break;
            case 'amqp':
                this.cmdAMQP(args);
                break;
            case 'zeromq':
                this.cmdZEROmq(args);
                break;
            case 'grpc':
                this.cmdGRPC(args);
                break;
            case 'thrift':
                this.cmdTHRIFT(args);
                break;
            case 'avro':
                this.cmdAVRO(args);
                break;
            case 'capnproto':
                this.cmdCAPNPROTO(args);
                break;
            case 'flatbuffers':
                this.cmdFLATBUFFERS(args);
                break;
            case 'messagepack':
                this.cmdMESSAGEPACK(args);
                break;
            case 'protobuf':
                this.cmdPROTOBUF(args);
                break;
            case 'bond':
                this.cmdBOND(args);
                break;
            case 'spark':
                this.cmdSPARK(args);
                break;
            case 'hadoop':
                this.cmdHADOOP(args);
                break;
            case 'hive':
                this.cmdHIVE(args);
                break;
            case 'pig':
                this.cmdPIG(args);
                break;
            case 'flink':
                this.cmdFLINK(args);
                break;
            case 'storm':
                this.cmdSTORM(args);
                break;
            case 'beam':
                this.cmdBEAM(args);
                break;
            case 'dask':
                this.cmdDASK(args);
                break;
            case 'ray':
                this.cmdRAY(args);
                break;
            case 'celery':
                this.cmdCELERY(args);
                break;
            case 'airflow':
                this.cmdAIRFLOW(args);
                break;
            case 'luigi':
                this.cmdLUIGI(args);
                break;
            case 'prefect':
                this.cmdPREFECT(args);
                break;
            case 'dagster':
                this.cmdDAGSTER(args);
                break;
            case 'kubeflow':
                this.cmdKUBEFLOW(args);
                break;
            case 'mlflow':
                this.cmdMLFLOW(args);
                break;
            case 'wandb':
                this.cmdWANDB(args);
                break;
            case 'neptune':
                this.cmdNEPTUNE(args);
                break;
            case 'comet':
                this.cmdCOMET(args);
                break;
            case 'scale':
                this.cmdSCALE(args);
                break;
            case 'terraform':
                this.cmdTERRAFORM(args);
                break;
            case 'ansible':
                this.cmdANSIBLE(args);
                break;
            case 'puppet':
                this.cmdPUPPET(args);
                break;
            case 'chef':
                this.cmdCHEF(args);
                break;
            case 'salt':
                this.cmdSALT(args);
                break;
            case 'cfn':
            case 'cloudformation':
                this.cmdCFN(args);
                break;
            case 'cloudify':
                this.cmdCLOUDIFY(args);
                break;
            case 'heat':
                this.cmdHEAT(args);
                break;
            case 'tosca':
                this.cmdTOSCA(args);
                break;
            case 'vagrant':
                this.cmdVAGRANT(args);
                break;
            case 'packer':
                this.cmdPACKER(args);
                break;
            case 'helm':
                this.cmdHELM(args);
                break;
            case 'kubectl':
                this.cmdKUBECTL(args);
                break;
            case 'minikube':
                this.cmdMINIKUBE(args);
                break;
            case 'kind':
                this.cmdKIND(args);
                break;
            case 'skaffold':
                this.cmdSKAFFOLD(args);
                break;
            case 'kustomize':
                this.cmdKUSTOMIZE(args);
                break;
            case 'istio':
                this.cmdISTIO(args);
                break;
            case 'linkerd':
                this.cmdLINKERD(args);
                break;
            case 'consul':
                this.cmdCONSUL(args);
                break;
            case 'nomad':
                this.cmdNOMAD(args);
                break;
            case 'vagrant-libvirt':
                this.cmdVAGRANTLIBVIRT();
                break;
            case 'libvirt':
                this.cmdLIBVIRT(args);
                break;
            case 'qemu':
                this.cmdQEMU(args);
                break;
            case 'kvm':
                this.cmdKVM(args);
                break;
            case 'xen':
                this.cmdXEN(args);
                break;
            case 'vmware':
                this.cmdVMWARE(args);
                break;
            case 'virtualbox':
                this.cmdVIRTUALBOX(args);
                break;
            case 'hyperv':
                this.cmdHYPERV(args);
                break;
            case 'parallels':
                this.cmdPARALLELS(args);
                break;
            case 'proxmox':
                this.cmdPROXMOX(args);
                break;
            case 'ostack':
            case 'openstack':
                this.cmdOPENSTACK(args);
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
╔════════════════════════════════════════════════════════════╗
║          HACK TERMINAL - コマンドリファレンス             ║
╚════════════════════════════════════════════════════════════╝

【ファイル/ディレクトリ操作】
  ls [path]              - ディレクトリの内容を表示
  ls -la                 - 詳細情報付きで表示
  cat <file>             - ファイルの内容を表示
  pwd                    - 現在のディレクトリを表示
  cd [path]              - ディレクトリを移動
  mkdir <dir>            - 新しいディレクトリを作成
  touch <file>           - ファイルを作成
  rm <file>              - ファイルを削除
  cp <src> <dst>         - ファイルをコピー
  mv <src> <dst>         - ファイルを移動
  chmod <mode> <file>    - ファイル権限を変更

【ファイル検索・処理】
  find <name>            - ファイルを検索
  grep <pattern> <file>  - テキストを検索
  head <file>            - ファイルの先頭を表示
  tail <file>            - ファイルの末尾を表示
  wc <file>              - 行数・単語数を数える
  sort <file>            - 行をソート
  diff <file1> <file2>   - ファイルの違いを表示
  hexdump <file>         - 16進ダンプを表示

【システム情報】
  whoami                 - 現在のユーザーを表示
  id                     - ユーザーID情報を表示
  groups                 - グループ情報を表示
  uname                  - システム情報を表示
  date                   - 現在の日時を表示
  ps                     - 実行中のプロセスを表示
  top                    - システムリソースを表示
  df                     - ディスク容量を表示
  du <path>              - ディレクトリサイズを表示
  free                   - メモリ使用量を表示
  env                    - 環境変数を表示
  history                - コマンド履歴を表示

【ネットワークコマンド】
  ping <host>            - ホスト到達性をテスト
  tracert <host>         - 経路をトレース
  netstat                - ネットワーク接続を表示
  ifconfig               - ネットワークインターフェース設定
  ipconfig               - IP設定を表示
  arp                    - ARP テーブルを表示
  ssh <user@host>        - SSH接続
  telnet <host>          - Telnet接続
  ftp <host>             - FTP接続
  curl <url>             - URLの内容を取得
  wget <url>             - ファイルをダウンロード
  dig <domain>           - DNS情報を照会
  whois <domain>         - ドメイン情報を照会
  nmap <host>            - ポートスキャン

【セキュリティツール】
  nmap <target>          - ネットワークスキャン
  sqlmap <url>           - SQLインジェクション検査
  hydra <target>         - ブルートフォース攻撃
  aircrack-ng <file>     - Wi-Fi パスワードクラック
  wireshark              - パケットキャプチャ
  metasploit             - エクスプロイトフレームワーク
  john <hashes>          - パスワードハッシュクラック
  hashcat <args>         - GPU ハッシュクラック
  openssl <cmd>          - 暗号化・復号化ツール
  gpg <args>             - GNU Privacy Guard
  steghide <args>        - ステガノグラフィツール

【ハッキングコマンド】
  exploit <target>       - エクスプロイト実行
  reverse-shell <ip>     - リバースシェル接続
  payload                - ペイロード一覧
  crack <hash>           - ハッシュをクラック
  shodan <query>         - Shodan 検索
  phantom                - 全システム掌握
  hack                   - ハッキング実行
  system <cmd>           - システムコマンド実行

【テキスト処理】
  echo <text>            - テキストを表示
  sed <args>             - ストリーム編集
  awk <args>             - テキスト処理
  tr <args>              - 文字置換
  cut <args>             - フィールド抽出
  paste <args>           - ファイル結合
  base64 <args>          - Base64 エンコード/デコード
  md5sum <file>          - MD5ハッシュ計算
  sha256sum <file>       - SHA256ハッシュ計算

【開発ツール】
  git <cmd>              - バージョン管理
  gcc <file>             - C/C++ コンパイル
  make                   - ビルド自動化
  python                 - Python インタプリタ
  node                   - Node.js インタプリタ
  docker <cmd>           - コンテナ管理

【その他】
  man <cmd>              - コマンドマニュアル
  which <cmd>            - コマンド位置を表示
  alias <name>=<cmd>     - コマンドエイリアス設定
  export <var>=<val>     - 環境変数設定
  nano <file>            - テキストエディタ
  less <file>            - ファイルビューア
  clear                  - 画面クリア
  help                   - このヘルプを表示
  exit                   - セッション終了

【スコアボーナス】
 基本コマンド: 5-20 ポイント
 ネットワーク: 15-25 ポイント
 セキュリティ: 25-40 ポイント
 ハッキング: 40-100 ポイント

ヒント: 秘密のファイルを見つけるとボーナスポイント獲得！
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

    // 新しいコマンド実装

    cmdMKDIR(path) {
        if (!path) {
            this.printOutput('使用法: mkdir <ディレクトリ名>\n');
            return;
        }
        this.printOutput(`ディレクトリ '${path}' を作成しました\n`);
        this.score += 5;
    }

    cmdRM(path) {
        if (!path) {
            this.printOutput('使用法: rm <ファイル>\n');
            return;
        }
        this.printOutput(`ファイル '${path}' を削除しました\n`);
        this.score += 10;
    }

    cmdMV(args) {
        if (args.length < 2) {
            this.printOutput('使用法: mv <元ファイル> <先ファイル>\n');
            return;
        }
        this.printOutput(`'${args[0]}' を '${args[1]}' に移動しました\n`);
        this.score += 10;
    }

    cmdCP(args) {
        if (args.length < 2) {
            this.printOutput('使用法: cp <元ファイル> <先ファイル>\n');
            return;
        }
        this.printOutput(`'${args[0]}' を '${args[1]}' にコピーしました\n`);
        this.score += 10;
    }

    cmdTOUCH(path) {
        if (!path) {
            this.printOutput('使用法: touch <ファイル名>\n');
            return;
        }
        this.printOutput(`ファイル '${path}' を作成しました\n`);
        this.score += 5;
    }

    cmdNANO(path) {
        if (!path) {
            this.printOutput('使用法: nano <ファイル名>\n');
            return;
        }
        this.printOutput(`nano '${path}' を開いています...\n`);
        this.printOutput('テキストを編集してください (Ctrl+X で保存)\n');
        this.score += 10;
    }

    cmdCHMOD(args) {
        if (args.length < 2) {
            this.printOutput('使用法: chmod <権限> <ファイル>\n');
            return;
        }
        this.printOutput(`'${args[1]}' の権限を ${args[0]} に変更しました\n`);
        this.score += 10;
    }

    cmdLSDetailed(path) {
        this.printOutput(`total 48\n`);
        this.printOutput(`drwxr-xr-x  5 root root  4096 Jan 17 10:00 .\n`);
        this.printOutput(`drwxr-xr-x  3 root root  4096 Jan 17 09:00 ..\n`);
        this.printOutput(`-rw-r--r--  1 root root   256 Jan 17 09:30 .bashrc\n`);
        this.printOutput(`-rw-r--r--  1 root root   512 Jan 17 09:30 .profile\n`);
        this.printOutput(`drwxr-xr-x  2 root root  4096 Jan 17 09:00 Desktop\n`);
        this.printOutput(`drwxr-xr-x  2 root root  4096 Jan 17 09:00 Documents\n`);
        this.printOutput(`drwxr-xr-x  2 root root  4096 Jan 17 09:00 Downloads\n`);
        this.score += 10;
    }

    cmdHISTORY() {
        this.printOutput(`コマンド履歴:\n`);
        this.commandHistory.forEach((cmd, idx) => {
            this.printOutput(`${idx + 1}  ${cmd}\n`);
        });
        this.score += 5;
    }

    cmdPS() {
        this.printOutput(`PID   USER     COMMAND\n`);
        this.printOutput(`  1   root     /sbin/init\n`);
        this.printOutput(`  42  root     sshd: /usr/sbin/sshd\n`);
        this.printOutput(`  123 user     bash\n`);
        this.printOutput(`  456 user     firefox\n`);
        this.printOutput(`  789 user     chrome\n`);
        this.score += 10;
    }

    cmdTOP() {
        this.printOutput(`top - 10:19:45 up 2 days, 3:45, 2 users, load average: 0.23, 0.18, 0.15\n`);
        this.printOutput(`Tasks:  125 total,   2 running, 123 sleeping,   0 stopped,   0 zombie\n`);
        this.printOutput(`%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.4 id,  0.3 wa,  0.0 hi,  0.0 si\n`);
        this.printOutput(`MiB Mem :  8192.0 total,  3892.1 free,  2154.2 used,  2145.7 buff/cache\n`);
        this.printOutput(`MiB Swap:  2048.0 total,  2048.0 free,     0.0 used.  5621.4 avail Mem\n`);
        this.score += 10;
    }

    cmdNETSTAT() {
        this.printOutput(`Active Internet connections (tcp), servers and established\n`);
        this.printOutput(`Proto Recv-Q Send-Q Local Address           Foreign Address         State\n`);
        this.printOutput(`tcp        0      0 127.0.0.1:22            0.0.0.0:*               LISTEN\n`);
        this.printOutput(`tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN\n`);
        this.printOutput(`tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN\n`);
        this.score += 10;
    }

    cmdIFCONFIG() {
        this.printOutput(`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>\n`);
        this.printOutput(`      inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n`);
        this.printOutput(`      inet6 fe80::1  prefixlen 64  scopeid 0x20<link>\n`);
        this.printOutput(`      ether 08:00:27:00:00:00  txqueuelen 1000\n`);
        this.score += 10;
    }

    cmdPING(host) {
        if (!host) {
            this.printOutput('使用法: ping <ホスト>\n');
            return;
        }
        this.printOutput(`PING ${host} (192.168.1.1) 56(84) bytes of data.\n`);
        this.printOutput(`64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.23 ms\n`);
        this.printOutput(`64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.45 ms\n`);
        this.printOutput(`64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=1.32 ms\n`);
        this.printOutput(`\n--- ${host} statistics ---\n`);
        this.printOutput(`3 packets transmitted, 3 received, 0% packet loss\n`);
        this.score += 15;
    }

    cmdTRACEROUTE(host) {
        if (!host) {
            this.printOutput('使用法: tracert <ホスト>\n');
            return;
        }
        this.printOutput(`Tracing route to ${host} [192.168.1.1]\n`);
        this.printOutput(`  1    2 ms    1 ms    2 ms  192.168.1.1\n`);
        this.printOutput(`  2   10 ms    9 ms   11 ms  10.0.0.1\n`);
        this.printOutput(`  3   45 ms   44 ms   46 ms  203.0.113.1\n`);
        this.score += 15;
    }

    cmdSSH(target) {
        if (!target) {
            this.printOutput('使用法: ssh <ユーザー@ホスト>\n');
            return;
        }
        this.printOutput(`ssh ${target} に接続中...\n`);
        this.printOutput(`ホスト認証キーを受け入れています...\n`);
        this.printOutput(`パスワードを入力してください: (入力非表示)\n`);
        this.score += 20;
    }

    cmdTELNET(target) {
        if (!target) {
            this.printOutput('使用法: telnet <ホスト> [ポート]\n');
            return;
        }
        this.printOutput(`${target} に接続中...\n`);
        this.printOutput(`Connected to ${target}\n`);
        this.score += 20;
    }

    cmdNMAP(target) {
        if (!target) {
            this.printOutput('使用法: nmap <ホスト>\n');
            return;
        }
        this.printOutput(`Starting Nmap 7.92 at ${new Date().toLocaleString()}\n`);
        this.printOutput(`Nmap scan report for ${target}\n`);
        this.printOutput(`Host is up (0.0012s latency).\n`);
        this.printOutput(`Not shown: 997 closed ports\n`);
        this.printOutput(`PORT    STATE SERVICE\n`);
        this.printOutput(`22/tcp  open  ssh\n`);
        this.printOutput(`80/tcp  open  http\n`);
        this.printOutput(`443/tcp open  https\n`);
        this.score += 25;
    }

    cmdUNAME() {
        this.printOutput(`Linux hacker 5.15.0-84-generic #93-Ubuntu SMP Wed Sep 6 12:12:38 UTC 2023 x86_64 GNU/Linux\n`);
        this.score += 5;
    }

    cmdMAN(command) {
        if (!command) {
            this.printOutput('使用法: man <コマンド>\n');
            return;
        }
        this.printOutput(`${command.toUpperCase()}(1)                     User Commands                    ${command.toUpperCase()}(1)\n`);
        this.printOutput(`\nNAME\n`);
        this.printOutput(`       ${command} - command description\n`);
        this.printOutput(`\nSYNOPSIS\n`);
        this.printOutput(`       ${command} [OPTIONS] [ARGUMENTS]\n`);
        this.score += 10;
    }

    cmdFILE(path) {
        if (!path) {
            this.printOutput('使用法: file <ファイル>\n');
            return;
        }
        this.printOutput(`${path}: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV)\n`);
        this.score += 10;
    }

    cmdHEAD(args) {
        if (args.length === 0) {
            this.printOutput('使用法: head <ファイル>\n');
            return;
        }
        const lines = 10;
        this.printOutput(`最初の ${lines} 行を表示:\n`);
        for (let i = 1; i <= lines; i++) {
            this.printOutput(`Line ${i} content\n`);
        }
        this.score += 10;
    }

    cmdTAIL(args) {
        if (args.length === 0) {
            this.printOutput('使用法: tail <ファイル>\n');
            return;
        }
        const lines = 10;
        this.printOutput(`最後の ${lines} 行を表示:\n`);
        for (let i = 1; i <= lines; i++) {
            this.printOutput(`Tail line ${i}\n`);
        }
        this.score += 10;
    }

    cmdWC(args) {
        if (args.length === 0) {
            this.printOutput('使用法: wc <ファイル>\n');
            return;
        }
        this.printOutput(`  1024  5120  45632 ${args.join(' ')}\n`);
        this.score += 10;
    }

    cmdSORT(path) {
        if (!path) {
            this.printOutput('使用法: sort <ファイル>\n');
            return;
        }
        this.printOutput(`行1\n行2\n行3\n行4\n行5\n`);
        this.score += 10;
    }

    cmdUNIQ(path) {
        if (!path) {
            this.printOutput('使用法: uniq <ファイル>\n');
            return;
        }
        this.printOutput(`unique line 1\nunique line 2\nunique line 3\n`);
        this.score += 10;
    }

    cmdDIFF(args) {
        if (args.length < 2) {
            this.printOutput('使用法: diff <ファイル1> <ファイル2>\n');
            return;
        }
        this.printOutput(`1c1\n< Old content\n---\n> New content\n`);
        this.score += 15;
    }

    cmdHEX(path) {
        if (!path) {
            this.printOutput('使用法: hexdump <ファイル>\n');
            return;
        }
        this.printOutput(`0000000 4865 6c6c 6f20 576f 726c 6421\n`);
        this.printOutput(`0000006\n`);
        this.score += 15;
    }

    cmdBASE64(args) {
        if (args.length === 0) {
            this.printOutput('使用法: base64 <オプション> <ファイル>\n');
            return;
        }
        this.printOutput(`SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBzZWNyZXQgbWVzc2FnZQ==\n`);
        this.score += 15;
    }

    cmdHASH(path) {
        if (!path) {
            this.printOutput('使用法: md5sum <ファイル>\n');
            return;
        }
        this.printOutput(`5d41402abc4b2a76b9719d911017c592  ${path}\n`);
        this.score += 15;
    }

    cmdCURL(url) {
        if (!url) {
            this.printOutput('使用法: curl <URL>\n');
            return;
        }
        this.printOutput(`% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n`);
        this.printOutput(`0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0\n`);
        this.printOutput(`100 1234  100 1234    0     0   5000      0 --:--:-- --:--:-- --:--:--  0.24s\n`);
        this.printOutput(`<html><head><title>Web Page</title></head>\n`);
        this.score += 15;
    }

    cmdWGET(url) {
        if (!url) {
            this.printOutput('使用法: wget <URL>\n');
            return;
        }
        this.printOutput(`--${new Date().toLocaleString()}--  ${url}\n`);
        this.printOutput(`Connecting to server... connected.\n`);
        this.printOutput(`HTTP/1.1 200 OK\n`);
        this.printOutput(`Saving to: 'index.html'\n`);
        this.score += 15;
    }

    cmdFTP(target) {
        if (!target) {
            this.printOutput('使用法: ftp <ホスト>\n');
            return;
        }
        this.printOutput(`Connected to ${target}\n`);
        this.printOutput(`220 Welcome to FTP Server\n`);
        this.printOutput(`Name: anonymous\n`);
        this.score += 15;
    }

    cmdARP() {
        this.printOutput(`Address                  HWtype  HWaddress           Flags Mask            Iface\n`);
        this.printOutput(`192.168.1.1              ether   08:00:27:00:00:01   C                     eth0\n`);
        this.printOutput(`192.168.1.50             ether   08:00:27:00:00:02   C                     eth0\n`);
        this.score += 10;
    }

    cmdIPCONFIG() {
        this.printOutput(`Windows IP Configuration\n\n`);
        this.printOutput(`Ethernet adapter Ethernet:\n`);
        this.printOutput(`   IPv4 Address. . . . . . . . . : 192.168.1.100\n`);
        this.printOutput(`   Subnet Mask . . . . . . . . . : 255.255.255.0\n`);
        this.score += 10;
    }

    cmdSYSTEMINFO() {
        this.printOutput(`Computer Name: HACKER-PC\n`);
        this.printOutput(`OS Name: Windows 10 Pro\n`);
        this.printOutput(`OS Version: 22H2\n`);
        this.printOutput(`System Boot Time: 2026-01-15 10:30:00\n`);
        this.printOutput(`Total Physical Memory: 16384 MB\n`);
        this.score += 10;
    }

    cmdTASKLIST() {
        this.printOutput(`Image Name                     PID Session Name        Session#    Mem Usage\n`);
        this.printOutput(`========================= ======== ================ =========== ============\n`);
        this.printOutput(`System                        4 Services          0       2,240 K\n`);
        this.printOutput(`svchost.exe                  256 Services          0       3,520 K\n`);
        this.printOutput(`chrome.exe                  1234 Console           1     256,000 K\n`);
        this.score += 10;
    }

    cmdWHOAMI() {
        this.printOutput(`root\n`);
        this.score += 5;
    }

    cmdID() {
        this.printOutput(`uid=0(root) gid=0(root) groups=0(root)\n`);
        this.score += 10;
    }

    cmdGROUPS() {
        this.printOutput(`root wheel sudo admin\n`);
        this.score += 10;
    }

    cmdSUDO(command) {
        if (!command) {
            this.printOutput('使用法: sudo <コマンド>\n');
            return;
        }
        this.printOutput(`[sudo] password for root: (入力非表示)\n`);
        this.printOutput(`${command} を実行中...\n`);
        this.score += 20;
    }

    cmdEXIT() {
        this.printOutput(`\nセッションを終了しています...\n`);
        this.score += 5;
    }

    cmdSHUTDOWN(args) {
        this.printOutput(`システムをシャットダウンしています...\n`);
        this.printOutput(`[    0.000000] 電源を切ります\n`);
        this.score += 25;
    }

    cmdREBOOT() {
        this.printOutput(`システムを再起動しています...\n`);
        this.printOutput(`[  OK  ] Stopped user manager service.\n`);
        this.printOutput(`Rebooting.\n`);
        this.score += 25;
    }

    cmdALIAS(args) {
        if (args.length === 0) {
            this.printOutput(`alias ll='ls -la'\nalias la='ls -a'\nalias l='ls -CF'\n`);
            this.score += 5;
            return;
        }
        this.printOutput(`エイリアス '${args[0]}' を設定しました\n`);
        this.score += 5;
    }

    cmdWHICH(command) {
        if (!command) {
            this.printOutput('使用法: which <コマンド>\n');
            return;
        }
        this.printOutput(`/usr/bin/${command}\n`);
        this.score += 10;
    }

    cmdENV() {
        this.printOutput(`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n`);
        this.printOutput(`HOME=/root\n`);
        this.printOutput(`SHELL=/bin/bash\n`);
        this.printOutput(`USER=root\n`);
        this.score += 10;
    }

    cmdEXPORT(variable) {
        if (!variable) {
            this.printOutput('使用法: export <変数>=<値>\n');
            return;
        }
        this.printOutput(`環境変数 '${variable}' を設定しました\n`);
        this.score += 10;
    }

    cmdUNSET(variable) {
        if (!variable) {
            this.printOutput('使用法: unset <変数>\n');
            return;
        }
        this.printOutput(`変数 '${variable}' を削除しました\n`);
        this.score += 10;
    }

    cmdSOURCE(file) {
        if (!file) {
            this.printOutput('使用法: source <ファイル>\n');
            return;
        }
        this.printOutput(`ファイル '${file}' を実行しました\n`);
        this.score += 10;
    }

    cmdMOUNT() {
        this.printOutput(`/dev/sda1 on / type ext4 (rw,relatime)\n`);
        this.printOutput(`devtmpfs on /dev type devtmpfs (rw,nosuid,relatime,size=4048348k,nr_inodes=1012087,mode=755)\n`);
        this.score += 10;
    }

    cmdUMOUNT(mount) {
        if (!mount) {
            this.printOutput('使用法: umount <マウントポイント>\n');
            return;
        }
        this.printOutput(`${mount} をアンマウントしました\n`);
        this.score += 10;
    }

    cmdDF() {
        this.printOutput(`Filesystem     1K-blocks      Used Available Use% Mounted on\n`);
        this.printOutput(`/dev/sda1       51475068  10238572  38545088  21% /\n`);
        this.printOutput(`devtmpfs         4048348         0   4048348   0% /dev\n`);
        this.score += 10;
    }

    cmdDU(path) {
        if (!path) {
            this.printOutput('使用法: du <パス>\n');
            return;
        }
        this.printOutput(`4096    ${path}\n`);
        this.score += 10;
    }

    cmdFREE() {
        this.printOutput(`              total        used        free      shared  buff/cache   available\n`);
        this.printOutput(`Mem:        8142456     2154280     3892145      234567     2095031     5621375\n`);
        this.printOutput(`Swap:       2097152           0     2097152\n`);
        this.score += 10;
    }

    cmdAPT(args) {
        if (args.length === 0) {
            this.printOutput('使用法: apt <サブコマンド>\n');
            return;
        }
        this.printOutput(`パッケージリストを読み込んでいます... 完了\n`);
        this.printOutput(`依存関係ツリーを作成しています\n`);
        this.score += 10;
    }

    cmdYUM(args) {
        if (args.length === 0) {
            this.printOutput('使用法: yum <サブコマンド>\n');
            return;
        }
        this.printOutput(`メタデータの設定中\n`);
        this.printOutput(`リポジトリを読み込んでいます...\n`);
        this.score += 10;
    }

    cmdPACMAN(args) {
        if (args.length === 0) {
            this.printOutput('使用法: pacman <オプション>\n');
            return;
        }
        this.printOutput(`パッケージデータベースを同期しています...\n`);
        this.score += 10;
    }

    cmdGIT(args) {
        if (args.length === 0) {
            this.printOutput('使用法: git <コマンド>\n');
            return;
        }
        const cmd = args[0];
        if (cmd === 'clone') {
            this.printOutput(`クローン中: ${args.join(' ')}\n`);
        } else if (cmd === 'commit') {
            this.printOutput(`[master 1a2b3c4] Commit message\n`);
        } else if (cmd === 'push') {
            this.printOutput(`ブランチ 'master' をプッシュしました\n`);
        }
        this.score += 20;
    }

    cmdDOCKER(args) {
        if (args.length === 0) {
            this.printOutput('使用法: docker <コマンド>\n');
            return;
        }
        this.printOutput(`Docker操作を実行中...\n`);
        this.score += 20;
    }

    cmdPYTHON(args) {
        this.printOutput(`Python 3.10.12 (main, Nov  6 2024, 20:43:13) [GCC 13.2.0] on linux\n`);
        this.printOutput(`Type "help", "copyright", "credits" or "license" for more information.\n`);
        this.printOutput(`>>> `);
        this.score += 15;
    }

    cmdNODE(args) {
        this.printOutput(`Welcome to Node.js v18.17.0\n`);
        this.printOutput(`Type ".help" for more information\n`);
        this.printOutput(`> `);
        this.score += 15;
    }

    cmdGCC(args) {
        if (args.length === 0) {
            this.printOutput('使用法: gcc <ファイル>\n');
            return;
        }
        this.printOutput(`${args[0]} をコンパイル中...\n`);
        this.printOutput(`コンパイル完了: a.out\n`);
        this.score += 20;
    }

    cmdMAKE() {
        this.printOutput(`gcc -c main.c\n`);
        this.printOutput(`gcc -c utils.c\n`);
        this.printOutput(`gcc main.o utils.o -o program\n`);
        this.score += 20;
    }

    cmdSED(args) {
        this.printOutput(`文字列置換を実行しました\n`);
        this.score += 15;
    }

    cmdAWK(args) {
        this.printOutput(`フィールド処理を実行しました\n`);
        this.score += 15;
    }

    cmdTR(args) {
        this.printOutput(`文字変換を実行しました\n`);
        this.score += 15;
    }

    cmdCUT(args) {
        this.printOutput(`フィールド抽出を実行しました\n`);
        this.score += 15;
    }

    cmdPASTE(args) {
        this.printOutput(`ファイルを結合しました\n`);
        this.score += 15;
    }

    cmdXARGS(args) {
        this.printOutput(`引数リストを構築して実行しました\n`);
        this.score += 15;
    }

    cmdTEE(args) {
        this.printOutput(`標準出力をファイルに出力しました\n`);
        this.score += 15;
    }

    cmdLESS(path) {
        if (!path) {
            this.printOutput('使用法: less <ファイル>\n');
            return;
        }
        this.printOutput(`ファイル '${path}' を表示中 (q で終了)\n`);
        this.score += 10;
    }

    cmdMORE(path) {
        if (!path) {
            this.printOutput('使用法: more <ファイル>\n');
            return;
        }
        this.printOutput(`ファイル '${path}' を表示中\n`);
        this.score += 10;
    }

    cmdSTRINGS(path) {
        if (!path) {
            this.printOutput('使用法: strings <ファイル>\n');
            return;
        }
        this.printOutput(`/lib64/ld-linux-x86-64.so.2\n`);
        this.printOutput(`__libc_start_main\n`);
        this.score += 15;
    }

    cmdOBJDUMP(args) {
        this.printOutput(`逆アセンブル結果:\n`);
        this.printOutput(`000000000000114a <main>:\n`);
        this.printOutput(`    114a:  55                  push   %rbp\n`);
        this.score += 20;
    }

    cmdREADELF(args) {
        this.printOutput(`ELF ヘッダ:\n`);
        this.printOutput(`  Magic:   7f 45 4c 46 02 01 01 00\n`);
        this.printOutput(`  Class:   ELF64\n`);
        this.score += 20;
    }

    cmdSTRACE(args) {
        this.printOutput(`execve("/bin/ls", ["ls"], [/* 50 vars */]) = 0\n`);
        this.printOutput(`brk(NULL)                               = 0x5617f000\n`);
        this.printOutput(`access(/etc/ld.so.nohwcap, F_OK)      = -1 ENOENT\n`);
        this.score += 20;
    }

    cmdLTRACE(args) {
        this.printOutput(`[0x7ffff7a05090] printf("Hello World\\n") = 12\n`);
        this.printOutput(`[0x7ffff7a05090] exit(0 <unfinished ...>\n`);
        this.score += 20;
    }

    cmdDISASSEMBLE(args) {
        this.printOutput(`Disassembly of section .text:\n`);
        this.printOutput(`0000000000001040 <main>:\n`);
        this.printOutput(`    1040:  55                  push   %rbp\n`);
        this.score += 20;
    }

    cmdSQLMAP(args) {
        this.printOutput(`[*] SQLmap開始\n`);
        this.printOutput(`[*] ターゲットをスキャン中...\n`);
        this.printOutput(`[+] SQL インジェクション脆弱性を検出しました\n`);
        this.printOutput(`[*] データベースの列挙中...\n`);
        this.score += 30;
    }

    cmdHYDRA(args) {
        this.printOutput(`[15][ssh] ホスト: ターゲット ユーザー: admin パス: password123\n`);
        this.printOutput(`[STATUS] 認証情報を試行中...\n`);
        this.score += 30;
    }

    cmdAIRCRACK(args) {
        this.printOutput(`[*] キャップチャーファイルを読み込み中...\n`);
        this.printOutput(`[+] SSID を検出しました\n`);
        this.printOutput(`[*] パスワードをクラック中...\n`);
        this.score += 30;
    }

    cmdWIRESHARK(args) {
        this.printOutput(`Capturing on 'eth0'...\n`);
        this.printOutput(`192.168.1.100 -> 192.168.1.1 TCP 22 > ssh\n`);
        this.printOutput(`192.168.1.1 -> 192.168.1.100 TCP ssh > 22\n`);
        this.score += 25;
    }

    cmdMETASPLOIT(args) {
        this.printOutput(`[*] Metasploit Framework セッション開始\n`);
        this.printOutput(`[*] エクスプロイトを読み込み中...\n`);
        this.printOutput(`[+] ペイロードを生成しました\n`);
        this.score += 35;
    }

    cmdBURP() {
        this.printOutput(`Burp Suite Community Edition を起動しています...\n`);
        this.printOutput(`[*] プロキシをセットアップ中...\n`);
        this.score += 25;
    }

    cmdNESSUS() {
        this.printOutput(`Nessus スキャンを開始しています...\n`);
        this.printOutput(`[*] 脆弱性をスキャン中...\n`);
        this.score += 25;
    }

    cmdSHODAN(query) {
        if (!query) {
            this.printOutput('使用法: shodan <検索クエリ>\n');
            return;
        }
        this.printOutput(`[*] Shodan を検索中: ${query}\n`);
        this.printOutput(`[+] 検索結果: 1,234 台のデバイスが見つかりました\n`);
        this.score += 20;
    }

    cmdWHOIS(domain) {
        if (!domain) {
            this.printOutput('使用法: whois <ドメイン>\n');
            return;
        }
        this.printOutput(`Domain Name: ${domain}\n`);
        this.printOutput(`Registrar: Example Registrar\n`);
        this.printOutput(`Creation Date: 2020-01-15\n`);
        this.score += 15;
    }

    cmdDIG(domain) {
        if (!domain) {
            this.printOutput('使用法: dig <ドメイン>\n');
            return;
        }
        this.printOutput(`; <<>> DiG 9.16.1 <<>> ${domain}\n`);
        this.printOutput(`; (1 server found)\n`);
        this.printOutput(`; global options: +cmd\n`);
        this.printOutput(`${domain}. 300 IN A 93.184.216.34\n`);
        this.score += 15;
    }

    cmdREVERSESHELL(target) {
        if (!target) {
            this.printOutput('使用法: reverse-shell <IP:ポート>\n');
            return;
        }
        this.printOutput(`[*] リバースシェルを接続中: ${target}\n`);
        this.printOutput(`[+] バックドアを確立しました\n`);
        this.score += 40;
    }

    cmdPAYLOAD() {
        this.printOutput(`利用可能なペイロード:\n`);
        this.printOutput(`- reverse_tcp\n`);
        this.printOutput(`- bind_tcp\n`);
        this.printOutput(`- reverse_http\n`);
        this.score += 25;
    }

    cmdEXPLOIT(target) {
        if (!target) {
            this.printOutput('使用法: exploit <ターゲット>\n');
            return;
        }
        this.printOutput(`[*] エクスプロイト実行中: ${target}\n`);
        this.printOutput(`[+] 脆弱性を検出しました\n`);
        this.printOutput(`[+] ペイロード送信中...\n`);
        this.printOutput(`[SUCCESS] 権限昇格完了\n`);
        this.score += 50;
    }

    cmdCRACK(hash) {
        if (!hash) {
            this.printOutput('使用法: crack <ハッシュ>\n');
            return;
        }
        this.printOutput(`[*] ハッシュをクラック中...\n`);
        this.printOutput(`[+] パスワード: password123\n`);
        this.score += 30;
    }

    cmdJOHN(args) {
        if (args.length === 0) {
            this.printOutput('使用法: john <ハッシュファイル>\n');
            return;
        }
        this.printOutput(`Loaded 1 password hash\n`);
        this.printOutput(`Trying default: \"password123\"... success\n`);
        this.score += 30;
    }

    cmdHASHCAT(args) {
        if (args.length === 0) {
            this.printOutput('使用法: hashcat <モード> <ハッシュ> <ワードリスト>\n');
            return;
        }
        this.printOutput(`[*] Hashcat セッション開始\n`);
        this.printOutput(`[+] ハッシュをクラック中...\n`);
        this.printOutput(`Recovered: 1/1 (100.00%) Digests\n`);
        this.score += 30;
    }

    cmdOPENSSL(args) {
        if (args.length === 0) {
            this.printOutput('使用法: openssl <コマンド>\n');
            return;
        }
        this.printOutput(`OpenSSL> ${args.join(' ')}\n`);
        this.score += 20;
    }

    cmdGPG(args) {
        if (args.length === 0) {
            this.printOutput('使用法: gpg <オプション>\n');
            return;
        }
        this.printOutput(`[GPG] 操作を実行中...\n`);
        this.score += 20;
    }

    cmdSTEGHIDE(args) {
        if (args.length === 0) {
            this.printOutput('使用法: steghide <エンベッド|抽出> <ファイル>\n');
            return;
        }
        this.printOutput(`[*] ステガノグラフィ操作を実行中...\n`);
        this.score += 25;
    }

    cmdPHANTOM(args) {
        this.printOutput(`╔═══════════════════════════════════════╗\n`);
        this.printOutput(`║     PHANTOM HACKER ACTIVATED         ║\n`);
        this.printOutput(`║     全システムを掌握しました          ║\n`);
        this.printOutput(`╚═══════════════════════════════════════╝\n`);
        this.score += 50;
    }

    cmdHACKER(text) {
        this.printOutput(`🔓 HACKER MODE ACTIVATED\n`);
        this.printOutput(`${text}\n`);
        this.score += 30;
    }

    cmdHACK() {
        this.printOutput(`╔═══════════════════════════════════════╗\n`);
        this.printOutput(`║    🔓  HACK COMPLETE  🔓              ║\n`);
        this.printOutput(`║    System compromised!                ║\n`);
        this.printOutput(`║    Root access obtained!             ║\n`);
        this.printOutput(`║    Data extraction in progress...    ║\n`);
        this.printOutput(`║    All security protocols disabled   ║\n`);
        this.printOutput(`╚═══════════════════════════════════════╝\n`);
        this.score += 100;
    }

    cmdSYSTEM(text) {
        this.printOutput(`[SYSTEM] ${text}\n`);
        this.printOutput(`実行中...\n`);
        this.score += 30;
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

    // Tab補完機能
    handleTabCompletion() {
        const input = this.commandInput.value.trim();
        
        if (!input) return;
        
        // スペースで分割してコマンドと引数を取得
        const parts = input.split(' ');
        const currentPart = parts[parts.length - 1];
        
        // コマンド補完とファイルパス補完を実行
        let suggestions = [];
        
        if (parts.length === 1) {
            // コマンド補完
            suggestions = this.getCommandSuggestions(currentPart);
        } else {
            // ファイルパス補完
            suggestions = this.getFileSuggestions(currentPart);
        }
        
        if (suggestions.length === 0) {
            return;
        } else if (suggestions.length === 1) {
            // 補完候補が1つの場合は自動補完
            parts[parts.length - 1] = suggestions[0];
            this.commandInput.value = parts.join(' ') + ' ';
        } else {
            // 複数の補完候補がある場合は表示
            this.displayCompletionSuggestions(suggestions);
        }
    }

    getCommandSuggestions(prefix) {
        const allCommands = [
            'ls', 'cat', 'pwd', 'cd', 'mkdir', 'rm', 'mv', 'cp', 'touch', 'nano',
            'chmod', 'history', 'ps', 'top', 'netstat', 'ifconfig', 'ping', 'tracert',
            'ssh', 'telnet', 'nmap', 'whoami', 'uname', 'man', 'file', 'head', 'tail',
            'wc', 'sort', 'uniq', 'diff', 'hex', 'hexdump', 'base64', 'md5sum', 'sha256sum',
            'curl', 'wget', 'ftp', 'arp', 'ipconfig', 'systeminfo', 'tasklist', 'id',
            'groups', 'sudo', 'exit', 'shutdown', 'reboot', 'alias', 'which', 'env',
            'export', 'unset', 'source', 'mount', 'umount', 'df', 'du', 'free', 'apt',
            'yum', 'pacman', 'git', 'docker', 'python', 'python3', 'node', 'gcc', 'make',
            'sed', 'awk', 'tr', 'cut', 'paste', 'xargs', 'tee', 'less', 'more', 'strings',
            'objdump', 'readelf', 'strace', 'ltrace', 'disassemble', 'sqlmap', 'hydra',
            'aircrack-ng', 'wireshark', 'metasploit', 'msfconsole', 'burp', 'nessus',
            'shodan', 'whois', 'dig', 'nslookup', 'reverse-shell', 'payload', 'exploit',
            'crack', 'john', 'hashcat', 'openssl', 'gpg', 'steghide', 'phantom', 'hacker',
            'hack', 'system', 'oput', 'echo', 'clear', 'find', 'grep', 'help', 'traceroute'
        ];
        
        return allCommands.filter(cmd => cmd.startsWith(prefix.toLowerCase()));
    }

    getFileSuggestions(prefix) {
        const suggestions = [];
        
        // 絶対パスか相対パスかを判定
        let basePath = this.currentPath;
        let searchPrefix = prefix;
        
        if (prefix.startsWith('/')) {
            basePath = '/';
            searchPrefix = prefix.substring(1);
        }
        
        // ディレクトリを取得
        const dir = this.getDirectory(basePath);
        if (!dir || !dir.contents) return suggestions;
        
        // 入力に合致するファイル/ディレクトリを検索
        for (const [name, item] of Object.entries(dir.contents)) {
            if (name.startsWith(searchPrefix)) {
                const suffix = item.type === 'directory' ? '/' : '';
                suggestions.push(name + suffix);
            }
        }
        
        return suggestions;
    }

    displayCompletionSuggestions(suggestions) {
        // 補完候補を表示
        let output = '\n📌 補完候補:\n';
        output += suggestions.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
        output += '\n\n';
        
        this.printOutput(output);
        
        // 共通プリフィックスを計算して補完
        const commonPrefix = this.getCommonPrefix(suggestions);
        if (commonPrefix.length > 0) {
            const parts = this.commandInput.value.trim().split(' ');
            parts[parts.length - 1] = commonPrefix;
            this.commandInput.value = parts.join(' ');
        }
    }

    getCommonPrefix(strings) {
        if (strings.length === 0) return '';
        if (strings.length === 1) return strings[0];
        
        let prefix = '';
        for (let i = 0; i < strings[0].length; i++) {
            const char = strings[0][i];
            if (strings.every(s => s[i] === char)) {
                prefix += char;
            } else {
                break;
            }
        }
        
        return prefix;
    }

    // 追加コマンド実装 (200+個)
    cmdIFSTAT() {
        this.printOutput(`Interface  RX-Bytes   RX-Pack   RX-Err   RX-Drop  TX-Bytes   TX-Pack   TX-Err   TX-Drop\n`);
        this.printOutput(`eth0      12345678    234567      0        0      87654321    156789      0        0\n`);
        this.score += 10;
    }

    cmdLSOF() {
        this.printOutput(`COMMAND    PID   USER   FD   TYPE DEVICE   SIZE/OFF    NODE NAME\n`);
        this.printOutput(`bash      1234   root  cwd    DIR    8,1     4096    1048577 /home/root\n`);
        this.printOutput(`bash      1234   root  rtd    DIR    8,1     4096       2 /\n`);
        this.score += 10;
    }

    cmdCHOWN(args) {
        if (args.length < 2) {
            this.printOutput('使用法: chown <ユーザー> <ファイル>\n');
            return;
        }
        this.printOutput(`${args[1]} の所有者を ${args[0]} に変更しました\n`);
        this.score += 10;
    }

    cmdUSERADD(username) {
        if (!username) {
            this.printOutput('使用法: useradd <ユーザー名>\n');
            return;
        }
        this.printOutput(`ユーザー '${username}' を追加しました\n`);
        this.score += 15;
    }

    cmdUSERDEL(username) {
        if (!username) {
            this.printOutput('使用法: userdel <ユーザー名>\n');
            return;
        }
        this.printOutput(`ユーザー '${username}' を削除しました\n`);
        this.score += 15;
    }

    cmdPASSWD(username) {
        this.printOutput(`パスワード変更中: ${username}\n`);
        this.printOutput(`新しいパスワード: (入力非表示)\n`);
        this.score += 20;
    }

    cmdSU(username) {
        if (!username) {
            this.printOutput('使用法: su <ユーザー名>\n');
            return;
        }
        this.printOutput(`パスワード: (入力非表示)\n`);
        this.printOutput(`${username}$ \n`);
        this.score += 20;
    }

    cmdVISUDO() {
        this.printOutput(`[visudo] sudoers ファイルを編集中...\n`);
        this.score += 15;
    }

    cmdCRONTAB(args) {
        this.printOutput(`crontab エディタを開いています...\n`);
        this.score += 15;
    }

    cmdAT(args) {
        this.printOutput(`at 実行スケジューラ\n`);
        this.printOutput(`at> (コマンドを入力)\n`);
        this.score += 15;
    }

    cmdSYSTEMCTL(args) {
        if (args.length === 0) {
            this.printOutput('使用法: systemctl <コマンド> <サービス>\n');
            return;
        }
        this.printOutput(`[systemctl] ${args.join(' ')} を実行中\n`);
        this.score += 15;
    }

    cmdSERVICE(args) {
        if (args.length < 2) {
            this.printOutput('使用法: service <サービス> <コマンド>\n');
            return;
        }
        this.printOutput(`サービス '${args[0]}' を ${args[1]} しています...\n`);
        this.score += 15;
    }

    cmdJOURNALCTL(args) {
        this.printOutput(`-- Logs begin at ${new Date().toLocaleString()}\n`);
        this.printOutput(`Jan 17 10:00:00 hacker systemd[1]: Started System Logging Service.\n`);
        this.score += 15;
    }

    cmdSYSLOG() {
        this.printOutput(`syslog サーバー\n`);
        this.printOutput(`ログレベル: INFO, WARN, ERROR, DEBUG\n`);
        this.score += 10;
    }

    cmdLOGROTATE() {
        this.printOutput(`logrotate による圧縮中...\n`);
        this.score += 10;
    }

    cmdDMESG() {
        this.printOutput(`[    0.000000] Linux version\n`);
        this.printOutput(`[    0.000000] Command line:\n`);
        this.printOutput(`[    0.000000] Memory: 4096M available\n`);
        this.score += 10;
    }

    cmdUPTIME() {
        this.printOutput(` 10:19:45 up 2 days,  3:45,  2 users,  load average: 0.23, 0.18, 0.15\n`);
        this.score += 5;
    }

    cmdW() {
        this.printOutput(` 10:19:45 up 2 days,  3:45,  2 users,  load average: 0.23, 0.18, 0.15\n`);
        this.printOutput(`USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\n`);
        this.printOutput(`root     pts/0    192.168.1.50     10:15   4.00s  0.13s  0.03s bash\n`);
        this.score += 10;
    }

    cmdFINGER(user) {
        this.printOutput(`Login: ${user}\n`);
        this.printOutput(`Last login: 2026-01-17 10:00 JST\n`);
        this.score += 10;
    }

    cmdLAST() {
        this.printOutput(`root     pts/0                         Fri Jan 17 10:15   still logged in\n`);
        this.printOutput(`user     pts/1                         Thu Jan 16 09:30 - 11:45 (02:15)\n`);
        this.score += 10;
    }

    cmdLASTLOG() {
        this.printOutput(`root                                  pts/0    Fri Jan 17 10:15:00\n`);
        this.score += 10;
    }

    cmdWHO() {
        this.printOutput(`root     pts/0        2026-01-17 10:15 (192.168.1.50)\n`);
        this.printOutput(`user     pts/1        2026-01-17 10:20 (192.168.1.51)\n`);
        this.score += 10;
    }

    cmdGETENT(args) {
        this.printOutput(`getent <データベース> <キー>\n`);
        this.score += 10;
    }

    cmdHOSTNAME(name) {
        if (!name) {
            this.printOutput(`hacker\n`);
        } else {
            this.printOutput(`ホスト名を '${name}' に変更しました\n`);
        }
        this.score += 10;
    }

    cmdDOMAINNAME() {
        this.printOutput(`example.local\n`);
        this.score += 10;
    }

    cmdTIMEDATECTL(args) {
        this.printOutput(`               Local time: Fri 2026-01-17 10:19:45 JST\n`);
        this.printOutput(`           Universal time: Fri 2026-01-17 01:19:45 UTC\n`);
        this.printOutput(`System clock synchronized: yes\n`);
        this.score += 10;
    }

    cmdHWCLOCK() {
        this.printOutput(`2026-01-17 10:19:45.000000+0900\n`);
        this.score += 10;
    }

    cmdLSCPU() {
        this.printOutput(`Architecture:        x86_64\n`);
        this.printOutput(`CPU op-mode(s):      32-bit, 64-bit\n`);
        this.printOutput(`Byte Order:          Little Endian\n`);
        this.printOutput(`CPU(s):              4\n`);
        this.score += 10;
    }

    cmdLSBLK() {
        this.printOutput(`NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS\n`);
        this.printOutput(`sda      8:0    0 1000G  0 disk\n`);
        this.printOutput(`└─sda1   8:1    0 1000G  0 part /\n`);
        this.score += 10;
    }

    cmdLSPCI() {
        this.printOutput(`00:00.0 Host bridge: Intel Corporation\n`);
        this.printOutput(`00:14.0 USB controller: Intel Corporation\n`);
        this.score += 10;
    }

    cmdLSUSB() {
        this.printOutput(`Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub\n`);
        this.score += 10;
    }

    cmdINXI() {
        this.printOutput(`System:    Host: hacker Kernel: 5.15.0 x86_64\n`);
        this.printOutput(`CPU:       4x Intel Core i7 @ 3.6GHz\n`);
        this.printOutput(`Memory:    16GB RAM\n`);
        this.score += 10;
    }

    cmdNEOFETCH() {
        this.printOutput(`                  -/osydddddddddddddddyy+-\n`);
        this.printOutput(`                /ydddddddddddddddddddddddy+\n`);
        this.printOutput(`               oddddddddddddddddddddddddddd\n`);
        this.printOutput(`               Linux 5.15.0 x86_64\n`);
        this.printOutput(`               Ubuntu 22.04.1 LTS\n`);
        this.score += 10;
    }

    cmdPOWEROFF() {
        this.printOutput(`システムをシャットダウンしています...\n`);
        this.score += 15;
    }

    cmdHALT() {
        this.printOutput(`システムを停止しています...\n`);
        this.score += 15;
    }

    cmdSYNC() {
        this.printOutput(`ディスクキャッシュをフラッシュしました\n`);
        this.score += 10;
    }

    cmdSWAP(args) {
        this.printOutput(`スワップを ${args.includes('off') ? '無効化' : '有効化'} しました\n`);
        this.score += 10;
    }

    cmdMKSWAP(args) {
        this.printOutput(`スワップエリアを初期化しました\n`);
        this.score += 15;
    }

    cmdFDISK(args) {
        this.printOutput(`Welcome to fdisk (util-linux 2.37.2).\n`);
        this.printOutput(`Changes will remain in memory until you decide to write them.\n`);
        this.score += 20;
    }

    cmdPARTED(args) {
        this.printOutput(`GNU Parted 3.4\n`);
        this.printOutput(`Using /dev/sda\n`);
        this.score += 20;
    }

    cmdMKFS(args) {
        this.printOutput(`ファイルシステムを作成しています...\n`);
        this.score += 20;
    }

    cmdFSCK(args) {
        this.printOutput(`ファイルシステムをチェック中...\n`);
        this.score += 20;
    }

    cmdTUNE2FS() {
        this.printOutput(`ext2/3/4 フォーマット調整\n`);
        this.score += 15;
    }

    cmdBLKID() {
        this.printOutput(`/dev/sda1: UUID="1234-5678" TYPE="ext4"\n`);
        this.score += 10;
    }

    cmdBADBLOCKS(args) {
        this.printOutput(`不良ブロックをチェック中...\n`);
        this.score += 20;
    }

    cmdSMARTCTL(args) {
        this.printOutput(`SMART Disk Health Monitor\n`);
        this.printOutput(`Device: /dev/sda\n`);
        this.printOutput(`Health Status: OK\n`);
        this.score += 15;
    }

    cmdRAID(args) {
        this.printOutput(`RAID レベル: 5\n`);
        this.printOutput(`ディスク数: 4\n`);
        this.score += 20;
    }

    cmdLVM(args) {
        this.printOutput(`Logical Volume Manager\n`);
        this.score += 15;
    }

    cmdPVCREATE() {
        this.printOutput(`物理ボリュームを作成しました\n`);
        this.score += 15;
    }

    cmdVGCREATE() {
        this.printOutput(`ボリュームグループを作成しました\n`);
        this.score += 15;
    }

    cmdLVCREATE() {
        this.printOutput(`論理ボリュームを作成しました\n`);
        this.score += 15;
    }

    cmdLVEXTEND() {
        this.printOutput(`論理ボリュームを拡張しました\n`);
        this.score += 15;
    }

    cmdLVREDUCE() {
        this.printOutput(`論理ボリュームを縮小しました\n`);
        this.score += 15;
    }

    cmdTAR(args) {
        this.printOutput(`tar アーカイブを処理中...\n`);
        this.score += 15;
    }

    cmdGZIP(args) {
        this.printOutput(`ファイルを圧縮中...\n`);
        this.score += 15;
    }

    cmdBZIP2(args) {
        this.printOutput(`Bzip2 で圧縮中...\n`);
        this.score += 15;
    }

    cmdXZ(args) {
        this.printOutput(`XZ 圧縮を実行中...\n`);
        this.score += 15;
    }

    cmdZIP(args) {
        this.printOutput(`ZIP アーカイブを処理中...\n`);
        this.score += 15;
    }

    cmdRAR(args) {
        this.printOutput(`RAR アーカイブを処理中...\n`);
        this.score += 15;
    }

    cmdAR(args) {
        this.printOutput(`ar アーカイバー\n`);
        this.score += 15;
    }

    cmd7Z(args) {
        this.printOutput(`7-Zip アーカイブ\n`);
        this.score += 15;
    }

    cmdCPIO(args) {
        this.printOutput(`CPIO アーカイブを処理中...\n`);
        this.score += 15;
    }

    cmdDD(args) {
        this.printOutput(`入力/出力のコピー\n`);
        this.printOutput(`0+0 records in\n`);
        this.score += 20;
    }

    cmdRSYNC(args) {
        this.printOutput(`rsync で同期中...\n`);
        this.score += 15;
    }

    cmdSCP(args) {
        this.printOutput(`SCP でファイルをコピー中...\n`);
        this.score += 15;
    }

    cmdSFTP(args) {
        this.printOutput(`SFTP セッションを開いています...\n`);
        this.score += 15;
    }

    cmdSSHPASS(args) {
        this.printOutput(`SSH パスワード自動入力\n`);
        this.score += 15;
    }

    cmdSSHKEYGEN(args) {
        this.printOutput(`SSH キーペアを生成中...\n`);
        this.printOutput(`Generating public/private rsa key pair.\n`);
        this.score += 20;
    }

    cmdSSHCOPYID(args) {
        this.printOutput(`公開キーを ${args} にコピー中...\n`);
        this.score += 15;
    }

    cmdSSHAGENT() {
        this.printOutput(`SSH Agent を起動しています\n`);
        this.score += 10;
    }

    cmdSSHADD(args) {
        this.printOutput(`秘密鍵をエージェントに追加中...\n`);
        this.score += 10;
    }

    cmdSSHFS(args) {
        this.printOutput(`SSHFS でリモートをマウント中...\n`);
        this.score += 15;
    }

    cmdAUTOSSH(args) {
        this.printOutput(`自動 SSH トンネル\n`);
        this.score += 15;
    }

    cmdPROXYCHAINS(args) {
        this.printOutput(`プロキシチェーン経由で実行中\n`);
        this.score += 20;
    }

    cmdTOR() {
        this.printOutput(`Tor ネットワークを初期化中...\n`);
        this.printOutput(`[notice] Bootstrapping connection to directory server\n`);
        this.score += 25;
    }

    cmdTORSOCKS(args) {
        this.printOutput(`Tor over SOCKS\n`);
        this.score += 20;
    }

    cmdOPENVPN(args) {
        this.printOutput(`OpenVPN を起動中...\n`);
        this.score += 20;
    }

    cmdVPNC(args) {
        this.printOutput(`Cisco VPN クライアント\n`);
        this.score += 20;
    }

    cmdWIREGUARD(args) {
        this.printOutput(`WireGuard VPN インターフェース\n`);
        this.score += 20;
    }

    cmdZEROTIER(args) {
        this.printOutput(`ZeroTier ネットワーク\n`);
        this.score += 20;
    }

    cmdSTUNNEL(args) {
        this.printOutput(`stunnel SSL トンネル\n`);
        this.score += 20;
    }

    cmdSOCAT(args) {
        this.printOutput(`ソケット コネクタ\n`);
        this.score += 15;
    }

    cmdNETCAT(args) {
        this.printOutput(`netcat で接続中...\n`);
        this.score += 15;
    }

    cmdAXEL(args) {
        this.printOutput(`Axel マルチスレッドダウンローダー\n`);
        this.score += 15;
    }

    cmdARIA2(args) {
        this.printOutput(`Aria2 ダウンローダー\n`);
        this.score += 15;
    }

    cmdYOUTUBEDL(args) {
        this.printOutput(`youtube-dl で動画をダウンロード中...\n`);
        this.score += 20;
    }

    cmdFFMPEG(args) {
        this.printOutput(`FFmpeg で変換中...\n`);
        this.score += 20;
    }

    cmdFFPROBE(args) {
        this.printOutput(`FFprobe でメディア情報を取得中...\n`);
        this.score += 15;
    }

    cmdCONVERT(args) {
        this.printOutput(`ImageMagick で変換中...\n`);
        this.score += 20;
    }

    cmdXCLIP(args) {
        this.printOutput(`クリップボード操作\n`);
        this.score += 10;
    }

    cmdXSEL(args) {
        this.printOutput(`選択テキスト操作\n`);
        this.score += 10;
    }

    cmdSCREEN(args) {
        this.printOutput(`GNU Screen セッション\n`);
        this.score += 15;
    }

    cmdTMUX(args) {
        this.printOutput(`tmux セッション\n`);
        this.score += 15;
    }

    cmdSCRIPT(args) {
        this.printOutput(`端末セッションを記録中...\n`);
        this.score += 10;
    }

    cmdEXPECT(args) {
        this.printOutput(`Expect TCL インタープリタ\n`);
        this.score += 15;
    }

    cmdPERL(args) {
        this.printOutput(`Perl インタープリタ\n`);
        this.score += 15;
    }

    cmdRUBY(args) {
        this.printOutput(`Ruby インタープリタ\n`);
        this.score += 15;
    }

    cmdLUA(args) {
        this.printOutput(`Lua インタープリタ\n`);
        this.score += 15;
    }

    cmdPHP(args) {
        this.printOutput(`PHP インタープリタ\n`);
        this.score += 15;
    }

    cmdJAVA(args) {
        this.printOutput(`Java 仮想マシン\n`);
        this.score += 15;
    }

    cmdJAVAC(args) {
        this.printOutput(`Java コンパイラ\n`);
        this.score += 15;
    }

    cmdSCALA(args) {
        this.printOutput(`Scala インタープリタ\n`);
        this.score += 15;
    }

    cmdGO(args) {
        this.printOutput(`Go コンパイラ\n`);
        this.score += 15;
    }

    cmdRUST(args) {
        this.printOutput(`Rust コンパイラ\n`);
        this.score += 15;
    }

    cmdCARGO(args) {
        this.printOutput(`Cargo パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdSWIFT(args) {
        this.printOutput(`Swift コンパイラ\n`);
        this.score += 15;
    }

    cmdKOTLIN(args) {
        this.printOutput(`Kotlin コンパイラ\n`);
        this.score += 15;
    }

    cmdGRADLE(args) {
        this.printOutput(`Gradle ビルドシステム\n`);
        this.score += 15;
    }

    cmdMAVEN(args) {
        this.printOutput(`Maven プロジェクトビルド\n`);
        this.score += 15;
    }

    cmdSBT(args) {
        this.printOutput(`Scala Build Tool\n`);
        this.score += 15;
    }

    cmdNPM(args) {
        this.printOutput(`Node Package Manager\n`);
        this.score += 15;
    }

    cmdYARN(args) {
        this.printOutput(`Yarn パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdPNPM(args) {
        this.printOutput(`PNPM パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdPIP(args) {
        this.printOutput(`Python Package Manager\n`);
        this.score += 15;
    }

    cmdPIPENV(args) {
        this.printOutput(`Pipenv 環境管理\n`);
        this.score += 15;
    }

    cmdPOETRY(args) {
        this.printOutput(`Poetry 依存関係管理\n`);
        this.score += 15;
    }

    cmdCONDA(args) {
        this.printOutput(`Conda パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdMAMBA(args) {
        this.printOutput(`Mamba パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdVIRTUALENV(args) {
        this.printOutput(`Python virtualenv\n`);
        this.score += 10;
    }

    cmdVENV(args) {
        this.printOutput(`Python venv\n`);
        this.score += 10;
    }

    cmdRVM(args) {
        this.printOutput(`Ruby Version Manager\n`);
        this.score += 10;
    }

    cmdNVM(args) {
        this.printOutput(`Node Version Manager\n`);
        this.score += 10;
    }

    cmdGVM(args) {
        this.printOutput(`Go Version Manager\n`);
        this.score += 10;
    }

    cmdJENV(args) {
        this.printOutput(`Java Version Manager\n`);
        this.score += 10;
    }

    cmdPYENV(args) {
        this.printOutput(`Python Version Manager\n`);
        this.score += 10;
    }

    cmdRBENV(args) {
        this.printOutput(`Ruby Version Manager\n`);
        this.score += 10;
    }

    cmdPLENV(args) {
        this.printOutput(`Perl Version Manager\n`);
        this.score += 10;
    }

    cmdNDENV(args) {
        this.printOutput(`Node Version Manager\n`);
        this.score += 10;
    }

    cmdDIRENV(args) {
        this.printOutput(`Directory Environment Manager\n`);
        this.score += 10;
    }

    cmdASDEF(args) {
        this.printOutput(`ASDF Version Manager\n`);
        this.score += 10;
    }

    cmdGUIX(args) {
        this.printOutput(`GNU Guix パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdNIX(args) {
        this.printOutput(`Nix パッケージマネージャー\n`);
        this.score += 15;
    }

    cmdFLATPAK(args) {
        this.printOutput(`Flatpak アプリケーション\n`);
        this.score += 15;
    }

    cmdSNAP(args) {
        this.printOutput(`Snap パッケージ\n`);
        this.score += 15;
    }

    cmdAPPIMAGE(args) {
        this.printOutput(`AppImage 実行ファイル\n`);
        this.score += 15;
    }

    cmdBAZEL(args) {
        this.printOutput(`Bazel ビルドシステム\n`);
        this.score += 15;
    }

    cmdCMAKE(args) {
        this.printOutput(`CMake ビルドジェネレータ\n`);
        this.score += 15;
    }

    cmdMESON(args) {
        this.printOutput(`Meson ビルドシステム\n`);
        this.score += 15;
    }

    cmdWAF(args) {
        this.printOutput(`WAF ビルドシステム\n`);
        this.score += 15;
    }

    cmdSCONS(args) {
        this.printOutput(`SCons ビルドシステム\n`);
        this.score += 15;
    }

    cmdANT(args) {
        this.printOutput(`Apache Ant ビルドツール\n`);
        this.score += 15;
    }

    cmdNINJA(args) {
        this.printOutput(`Ninja ビルドシステム\n`);
        this.score += 15;
    }

    cmdTUP(args) {
        this.printOutput(`Tup ファイルベースのビルド\n`);
        this.score += 15;
    }

    cmdREDO(args) {
        this.printOutput(`Redo ビルドシステム\n`);
        this.score += 15;
    }

    cmdSHAKE(args) {
        this.printOutput(`Shake ビルドシステム\n`);
        this.score += 15;
    }

    cmdFABRIC(args) {
        this.printOutput(`Fabric デプロイメントツール\n`);
        this.score += 15;
    }

    cmdINVOKE(args) {
        this.printOutput(`Invoke タスク実行ツール\n`);
        this.score += 15;
    }

    cmdRAKE(args) {
        this.printOutput(`Rake Ruby ビルドツール\n`);
        this.score += 15;
    }

    cmdGULP(args) {
        this.printOutput(`Gulp タスク自動化\n`);
        this.score += 15;
    }

    cmdGRUNT(args) {
        this.printOutput(`Grunt タスク実行ツール\n`);
        this.score += 15;
    }

    cmdWEBPACK(args) {
        this.printOutput(`Webpack モジュールバンドラー\n`);
        this.score += 15;
    }

    cmdPARCEL(args) {
        this.printOutput(`Parcel バンドラー\n`);
        this.score += 15;
    }

    cmdVITE(args) {
        this.printOutput(`Vite フロントエンドビルドツール\n`);
        this.score += 15;
    }

    cmdROLLUP(args) {
        this.printOutput(`Rollup JavaScript バンドラー\n`);
        this.score += 15;
    }

    cmdESBUILD(args) {
        this.printOutput(`esbuild JavaScript バンドラー\n`);
        this.score += 15;
    }

    cmdSWC(args) {
        this.printOutput(`SWC JavaScript コンパイラ\n`);
        this.score += 15;
    }

    cmdESPRIMA(args) {
        this.printOutput(`Esprima JavaScript パーサー\n`);
        this.score += 15;
    }

    cmdBABEL(args) {
        this.printOutput(`Babel JavaScript トランスパイラー\n`);
        this.score += 15;
    }

    cmdTYPESCRIPT(args) {
        this.printOutput(`TypeScript コンパイラ\n`);
        this.score += 15;
    }

    cmdDENO(args) {
        this.printOutput(`Deno JavaScript/TypeScript ランタイム\n`);
        this.score += 15;
    }

    cmdBUN(args) {
        this.printOutput(`Bun JavaScript ランタイム\n`);
        this.score += 15;
    }

    cmdWASM(args) {
        this.printOutput(`WebAssembly ランタイム\n`);
        this.score += 20;
    }

    cmdDEBUGGER(args) {
        this.printOutput(`GDB/LLDB デバッガー\n`);
        this.score += 20;
    }

    cmdVALGRIND(args) {
        this.printOutput(`Valgrind メモリプロファイラー\n`);
        this.score += 20;
    }

    cmdPERF(args) {
        this.printOutput(`Linux パフォーマンス分析\n`);
        this.score += 20;
    }

    cmdOPROFILE(args) {
        this.printOutput(`OProfile システムプロファイラー\n`);
        this.score += 20;
    }

    cmdGCOV(args) {
        this.printOutput(`GCOV コード カバレッジ\n`);
        this.score += 15;
    }

    cmdLCOV(args) {
        this.printOutput(`LCOV カバレッジレポート\n`);
        this.score += 15;
    }

    cmdCPPCHECK(args) {
        this.printOutput(`Cppcheck C/C++ 静的解析\n`);
        this.score += 15;
    }

    cmdCLANG(args) {
        this.printOutput(`Clang C/C++ コンパイラ\n`);
        this.score += 15;
    }

    cmdTSLINT(args) {
        this.printOutput(`TSLint TypeScript linter\n`);
        this.score += 15;
    }

    cmdESLINT(args) {
        this.printOutput(`ESLint JavaScript linter\n`);
        this.score += 15;
    }

    cmdPYLINT(args) {
        this.printOutput(`Pylint Python linter\n`);
        this.score += 15;
    }

    cmdMYPY(args) {
        this.printOutput(`mypy Python 型チェッカー\n`);
        this.score += 15;
    }

    cmdBLACK(args) {
        this.printOutput(`Black Python フォーマッター\n`);
        this.score += 15;
    }

    cmdFLAKE8(args) {
        this.printOutput(`Flake8 Python linter\n`);
        this.score += 15;
    }

    cmdAUTOPEP8(args) {
        this.printOutput(`autopep8 Python フォーマッター\n`);
        this.score += 15;
    }

    cmdISSORT(args) {
        this.printOutput(`isort Python import ソーター\n`);
        this.score += 15;
    }

    cmdPRETTIER(args) {
        this.printOutput(`Prettier コードフォーマッター\n`);
        this.score += 15;
    }

    cmdSHELLCHECK(args) {
        this.printOutput(`ShellCheck シェルスクリプト linter\n`);
        this.score += 15;
    }

    cmdSHFMT(args) {
        this.printOutput(`shfmt シェルスクリプト フォーマッター\n`);
        this.score += 15;
    }

    cmdYAMLLINT(args) {
        this.printOutput(`yamllint YAML linter\n`);
        this.score += 15;
    }

    cmdJSONLINT(args) {
        this.printOutput(`jsonlint JSON バリデータ\n`);
        this.score += 15;
    }

    cmdXMLLINT(args) {
        this.printOutput(`xmllint XML バリデータ\n`);
        this.score += 15;
    }

    cmdJQ(args) {
        this.printOutput(`jq JSON プロセッサー\n`);
        this.score += 15;
    }

    cmdYQ(args) {
        this.printOutput(`yq YAML プロセッサー\n`);
        this.score += 15;
    }

    cmdTOML(args) {
        this.printOutput(`TOML パーサー\n`);
        this.score += 15;
    }

    cmdPROTOC(args) {
        this.printOutput(`Protocol Buffers コンパイラ\n`);
        this.score += 15;
    }

    cmdGRAPHQL(args) {
        this.printOutput(`GraphQL クエリエンジン\n`);
        this.score += 15;
    }

    cmdSQL(args) {
        this.printOutput(`SQL データベースクライアント\n`);
        this.score += 15;
    }

    cmdMYSQL(args) {
        this.printOutput(`MySQL データベースクライアント\n`);
        this.score += 15;
    }

    cmdPSQL(args) {
        this.printOutput(`PostgreSQL クライアント\n`);
        this.score += 15;
    }

    cmdMONGODB(args) {
        this.printOutput(`MongoDB シェル\n`);
        this.score += 15;
    }

    cmdREDIS(args) {
        this.printOutput(`Redis CLI\n`);
        this.score += 15;
    }

    cmdCASSANDRA(args) {
        this.printOutput(`Cassandra ノード\n`);
        this.score += 15;
    }

    cmdELASTICSEARCH(args) {
        this.printOutput(`Elasticsearch ノード\n`);
        this.score += 15;
    }

    cmdINFLUX(args) {
        this.printOutput(`InfluxDB クライアント\n`);
        this.score += 15;
    }

    cmdPROMETHEUS(args) {
        this.printOutput(`Prometheus メトリクス\n`);
        this.score += 15;
    }

    cmdGRAPHITE(args) {
        this.printOutput(`Graphite 時系列データベース\n`);
        this.score += 15;
    }

    cmdZABBIX(args) {
        this.printOutput(`Zabbix 監視\n`);
        this.score += 15;
    }

    cmdNAGIOS(args) {
        this.printOutput(`Nagios 監視\n`);
        this.score += 15;
    }

    cmdICINGA(args) {
        this.printOutput(`Icinga 監視\n`);
        this.score += 15;
    }

    cmdSENSU(args) {
        this.printOutput(`Sensu 監視\n`);
        this.score += 15;
    }

    cmdDATADOG(args) {
        this.printOutput(`Datadog エージェント\n`);
        this.score += 15;
    }

    cmdNEWRELIC(args) {
        this.printOutput(`New Relic エージェント\n`);
        this.score += 15;
    }

    cmdSPLUNK(args) {
        this.printOutput(`Splunk ログ分析\n`);
        this.score += 15;
    }

    cmdSUMO(args) {
        this.printOutput(`Sumo Logic ログ分析\n`);
        this.score += 15;
    }

    cmdLOGZ(args) {
        this.printOutput(`Logz.io ログプラットフォーム\n`);
        this.score += 15;
    }

    cmdPAPERTRAIL(args) {
        this.printOutput(`Papertrail ログ管理\n`);
        this.score += 15;
    }

    cmdDATABUS(args) {
        this.printOutput(`Databus データストリーム\n`);
        this.score += 15;
    }

    cmdKAFKA(args) {
        this.printOutput(`Apache Kafka メッセージング\n`);
        this.score += 20;
    }

    cmdRABBITMQ(args) {
        this.printOutput(`RabbitMQ メッセージング\n`);
        this.score += 20;
    }

    cmdACTIVEMQ(args) {
        this.printOutput(`ActiveMQ メッセージング\n`);
        this.score += 20;
    }

    cmdNATS(args) {
        this.printOutput(`NATS メッセージング\n`);
        this.score += 20;
    }

    cmdMQTT(args) {
        this.printOutput(`MQTT IoT メッセージング\n`);
        this.score += 20;
    }

    cmdAMQP(args) {
        this.printOutput(`AMQP メッセージング\n`);
        this.score += 20;
    }

    cmdZEROmq(args) {
        this.printOutput(`ZeroMQ メッセージング\n`);
        this.score += 20;
    }

    cmdGRPC(args) {
        this.printOutput(`gRPC RPC フレームワーク\n`);
        this.score += 20;
    }

    cmdTHRIFT(args) {
        this.printOutput(`Apache Thrift RPC\n`);
        this.score += 20;
    }

    cmdAVRO(args) {
        this.printOutput(`Apache Avro シリアライゼーション\n`);
        this.score += 15;
    }

    cmdCAPNPROTO(args) {
        this.printOutput(`Cap'n Proto シリアライゼーション\n`);
        this.score += 15;
    }

    cmdFLATBUFFERS(args) {
        this.printOutput(`FlatBuffers シリアライゼーション\n`);
        this.score += 15;
    }

    cmdMESSAGEPACK(args) {
        this.printOutput(`MessagePack シリアライゼーション\n`);
        this.score += 15;
    }

    cmdPROTOBUF(args) {
        this.printOutput(`Protocol Buffers シリアライゼーション\n`);
        this.score += 15;
    }

    cmdBOND(args) {
        this.printOutput(`Microsoft Bond シリアライゼーション\n`);
        this.score += 15;
    }

    cmdSPARK(args) {
        this.printOutput(`Apache Spark 分散処理\n`);
        this.score += 25;
    }

    cmdHADOOP(args) {
        this.printOutput(`Apache Hadoop 分散処理\n`);
        this.score += 25;
    }

    cmdHIVE(args) {
        this.printOutput(`Apache Hive データウェアハウス\n`);
        this.score += 20;
    }

    cmdPIG(args) {
        this.printOutput(`Apache Pig データ分析\n`);
        this.score += 20;
    }

    cmdFLINK(args) {
        this.printOutput(`Apache Flink ストリーム処理\n`);
        this.score += 25;
    }

    cmdSTORM(args) {
        this.printOutput(`Apache Storm ストリーム処理\n`);
        this.score += 25;
    }

    cmdBEAM(args) {
        this.printOutput(`Apache Beam データ処理\n`);
        this.score += 25;
    }

    cmdDASK(args) {
        this.printOutput(`Dask 分散計算\n`);
        this.score += 20;
    }

    cmdRAY(args) {
        this.printOutput(`Ray 分散計算\n`);
        this.score += 20;
    }

    cmdCELERY(args) {
        this.printOutput(`Celery 分散タスク\n`);
        this.score += 20;
    }

    cmdAIRFLOW(args) {
        this.printOutput(`Apache Airflow ワークフロー\n`);
        this.score += 20;
    }

    cmdLUIGI(args) {
        this.printOutput(`Luigi ワークフロー\n`);
        this.score += 20;
    }

    cmdPREFECT(args) {
        this.printOutput(`Prefect ワークフロー\n`);
        this.score += 20;
    }

    cmdDAGSTER(args) {
        this.printOutput(`Dagster ワークフロー\n`);
        this.score += 20;
    }

    cmdKUBEFLOW(args) {
        this.printOutput(`Kubeflow ML ワークフロー\n`);
        this.score += 25;
    }

    cmdMLFLOW(args) {
        this.printOutput(`MLflow ML 実験追跡\n`);
        this.score += 20;
    }

    cmdWANDB(args) {
        this.printOutput(`Weights & Biases ML 実験\n`);
        this.score += 20;
    }

    cmdNEPTUNE(args) {
        this.printOutput(`Neptune ML メタデータ\n`);
        this.score += 20;
    }

    cmdCOMET(args) {
        this.printOutput(`Comet ML 実験\n`);
        this.score += 20;
    }

    cmdSCALE(args) {
        this.printOutput(`Scale AI データラベリング\n`);
        this.score += 20;
    }

    cmdTERRAFORM(args) {
        this.printOutput(`Terraform インフラ管理\n`);
        this.score += 25;
    }

    cmdANSIBLE(args) {
        this.printOutput(`Ansible 構成管理\n`);
        this.score += 25;
    }

    cmdPUPPET(args) {
        this.printOutput(`Puppet 構成管理\n`);
        this.score += 25;
    }

    cmdCHEF(args) {
        this.printOutput(`Chef 構成管理\n`);
        this.score += 25;
    }

    cmdSALT(args) {
        this.printOutput(`SaltStack 構成管理\n`);
        this.score += 25;
    }

    cmdCFN(args) {
        this.printOutput(`AWS CloudFormation\n`);
        this.score += 25;
    }

    cmdCLOUDIFY(args) {
        this.printOutput(`Cloudify オーケストレーション\n`);
        this.score += 25;
    }

    cmdHEAT(args) {
        this.printOutput(`OpenStack Heat\n`);
        this.score += 25;
    }

    cmdTOSCA(args) {
        this.printOutput(`TOSCA オーケストレーション\n`);
        this.score += 25;
    }

    cmdVAGRANT(args) {
        this.printOutput(`Vagrant VM 管理\n`);
        this.score += 20;
    }

    cmdPACKER(args) {
        this.printOutput(`Packer イメージビルド\n`);
        this.score += 20;
    }

    cmdHELM(args) {
        this.printOutput(`Helm Kubernetes パッケージ\n`);
        this.score += 20;
    }

    cmdKUBECTL(args) {
        this.printOutput(`kubectl Kubernetes クライアント\n`);
        this.score += 25;
    }

    cmdMINIKUBE(args) {
        this.printOutput(`Minikube Kubernetes\n`);
        this.score += 20;
    }

    cmdKIND(args) {
        this.printOutput(`Kind Kubernetes\n`);
        this.score += 20;
    }

    cmdSKAFFOLD(args) {
        this.printOutput(`Skaffold Kubernetes 開発\n`);
        this.score += 20;
    }

    cmdKUSTOMIZE(args) {
        this.printOutput(`Kustomize Kubernetes 管理\n`);
        this.score += 20;
    }

    cmdISTIO(args) {
        this.printOutput(`Istio サービスメッシュ\n`);
        this.score += 25;
    }

    cmdLINKERD(args) {
        this.printOutput(`Linkerd サービスメッシュ\n`);
        this.score += 25;
    }

    cmdCONSUL(args) {
        this.printOutput(`Consul サービスディスカバリー\n`);
        this.score += 25;
    }

    cmdNOMAD(args) {
        this.printOutput(`Nomad オーケストレーション\n`);
        this.score += 25;
    }

    cmdVAGRANTLIBVIRT() {
        this.printOutput(`Vagrant + Libvirt\n`);
        this.score += 20;
    }

    cmdLIBVIRT(args) {
        this.printOutput(`Libvirt 仮想化\n`);
        this.score += 20;
    }

    cmdQEMU(args) {
        this.printOutput(`QEMU エミュレータ\n`);
        this.score += 20;
    }

    cmdKVM(args) {
        this.printOutput(`KVM 仮想化\n`);
        this.score += 20;
    }

    cmdXEN(args) {
        this.printOutput(`Xen ハイパーバイザー\n`);
        this.score += 20;
    }

    cmdVMWARE(args) {
        this.printOutput(`VMware 仮想化\n`);
        this.score += 20;
    }

    cmdVIRTUALBOX(args) {
        this.printOutput(`VirtualBox 仮想化\n`);
        this.score += 20;
    }

    cmdHYPERV(args) {
        this.printOutput(`Hyper-V ハイパーバイザー\n`);
        this.score += 20;
    }

    cmdPARALLELS(args) {
        this.printOutput(`Parallels Desktop\n`);
        this.score += 20;
    }

    cmdPROXMOX(args) {
        this.printOutput(`Proxmox VE 仮想化\n`);
        this.score += 25;
    }

    cmdOPENSTACK(args) {
        this.printOutput(`OpenStack クラウドプラットフォーム\n`);
        this.score += 30;
    }
}

// ページ読み込み時にゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    new TextAdventureGame();
});

