// =====================================
// バトルアリーナ - ハッカータイパー
// =====================================

class BattleArena {
    constructor() {
        // ログイン状態を確認
        let playerName = localStorage.getItem('playerName');
        
        // クッキーからも読み込み
        if (!playerName) {
            playerName = this.getCookie('playerName');
        }
        
        if (!playerName) {
            alert('戦うにはログインが必要です');
            window.location.href = '/';
            return;
        }
        
        // DOM要素
        this.playerInput = document.getElementById('playerInput');
        this.playerOutput = document.getElementById('playerOutput');
        this.playerName = document.getElementById('playerName');
        this.playerPrompt = document.getElementById('playerPrompt');
        
        this.opponentOutput = document.getElementById('opponentOutput');
        this.opponentName = document.getElementById('opponentName');
        
        this.battleInfo = document.getElementById('battleInfo');
        
        // バトル状態
        this.playerCommandCount = 0;
        this.opponentCommandCount = 0;
        this.battleActive = true;
        this.battleId = null;
        this.lastFetchedOpponentCommands = 0;
        this.findingOpponent = false;  // マッチング中フラグ
        
        // CSRFトークン取得
        const csrfElement = document.querySelector('[name=csrfmiddlewaretoken]');
        this.csrfToken = csrfElement ? csrfElement.value : '';
        
        // プレイヤー情報
        this.playerName.textContent = playerName;
        this.findOpponent();
        this.setupEventListeners();
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
    
    findOpponent() {
        // すでにマッチング中なら繰り返さない
        if (this.findingOpponent) {
            return;
        }
        
        this.findingOpponent = true;
        this.printOutput('対戦相手を探索中...\n', this.playerOutput);
        
        fetch('/api/find-opponent/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.csrfToken,
            },
            body: JSON.stringify({
                player_name: this.playerName.textContent
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'found') {
                // マッチング成功
                this.battleId = data.battle_id;
                this.opponentName.textContent = data.opponent;
                this.findingOpponent = false;  // フラグをクリア
                this.initializeBattle();
                this.startOpponentPolling();
            } else if (data.status === 'waiting') {
                this.printOutput(`マッチング待機中...\n`, this.playerOutput);
                // 2秒後に再度検索
                this.findingOpponent = false;  // フラグをクリアして次の試行を許可
                setTimeout(() => this.findOpponent(), 2000);
            }
        })
        .catch(err => {
            console.error('対戦相手検索エラー:', err);
            this.findingOpponent = false;  // エラー時もフラグクリア
            this.printOutput('エラー: 対戦相手を探せませんでした\n', this.playerOutput);
            // エラーでも再試行
            setTimeout(() => this.findOpponent(), 3000);
        });
    }
        });
    }
    
    initializeBattle() {
        this.playerOutput.innerHTML = '';
        this.opponentOutput.innerHTML = '';
        
        this.printOutput('=== バトルアリーナ開始 ===\n', this.playerOutput);
        this.printOutput(`あなた: ${this.playerName.textContent}\n`, this.playerOutput);
        this.printOutput(`相手: ${this.opponentName.textContent}\n\n`, this.playerOutput);
        this.printOutput('コマンドを入力してバトルを開始します！\n\n', this.playerOutput);
        
        // 相手の初期画面
        this.printOutput('対戦相手が見つかりました\n', this.opponentOutput);
        this.printOutput(`相手: ${this.playerName.textContent}\n\n`, this.opponentOutput);
        
        this.playerInput.focus();
    }
    
    setupEventListeners() {
        this.playerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
        
        // リアルタイムで入力中のテキストを送信
        this.playerInput.addEventListener('keyup', () => {
            if (!this.battleId) return;
            
            const typingText = this.playerInput.value;
            
            fetch('/api/update-player-typing/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken,
                },
                body: JSON.stringify({
                    battle_id: this.battleId,
                    player_name: this.playerName.textContent,
                    typing_text: typingText
                })
            })
            .catch(err => console.error('入力テキスト送信エラー:', err));
        });
    }
    
    executeCommand() {
        const input = this.playerInput.value.trim();
        if (!input || !this.battleId) {
            this.playerInput.value = '';
            return;
        }
        
        // プレイヤーのコマンド表示
        this.printOutput(`root@terminal:~$ ${input}\n`, this.playerOutput);
        this.playerInput.value = '';
        this.playerCommandCount++;
        
        // コマンドの実行結果をシミュレート
        const result = this.getCommandResult(input);
        this.printOutput(result + '\n', this.playerOutput);
        
        // サーバーにコマンドを送信
        fetch('/api/battle-command/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.csrfToken,
            },
            body: JSON.stringify({
                battle_id: this.battleId,
                player_name: this.playerName.textContent,
                command: input
            })
        })
        .catch(err => console.error('コマンド送信エラー:', err));
        
        // スコア更新
        this.updateBattleStatus();
    }
    
    startOpponentPolling() {
        // 相手の入力中テキストと完成コマンドを定期的に取得
        this.opponentPollInterval = setInterval(() => {
            if (!this.battleId) return;
            
            // 相手のコマンドを取得
            fetch(`/api/get-opponent-commands/?battle_id=${this.battleId}&player_name=${this.playerName.textContent}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.commands) {
                        // 新しいコマンドのみ表示
                        const newCommands = data.commands.slice(this.lastFetchedOpponentCommands);
                        newCommands.forEach(cmd => {
                            this.printOutput(`opponent:~$ ${cmd.command}\n`, this.opponentOutput);
                            const result = this.getCommandResult(cmd.command);
                            this.printOutput(result + '\n', this.opponentOutput);
                            this.opponentCommandCount++;
                        });
                        this.lastFetchedOpponentCommands = data.commands.length;
                        this.updateBattleStatus();
                    }
                })
                .catch(err => console.error('相手コマンド取得エラー:', err));
            
            // 相手の入力中テキストを取得
            fetch(`/api/get-opponent-typing/?battle_id=${this.battleId}&player_name=${this.playerName.textContent}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // 相手の入力中のテキストを表示
                        const typingText = data.typing_text;
                        const prompt = this.opponentOutput.querySelector('.opponent-prompt') || 
                                      (() => {
                                          const p = document.createElement('span');
                                          p.className = 'opponent-prompt';
                                          this.opponentOutput.appendChild(p);
                                          return p;
                                      })();
                        
                        if (typingText) {
                            prompt.textContent = `opponent:~$ ${typingText}`;
                        } else {
                            if (prompt.parentNode) {
                                prompt.parentNode.removeChild(prompt);
                            }
                        }
                    }
                })
                .catch(err => console.error('相手入力テキスト取得エラー:', err));
        }, 500);  // 0.5秒ごとにリアルタイム更新
    }
    
    getCommandResult(command) {
        const responses = {
            'ls': 'file1.txt  file2.txt  secret.txt  config.db',
            'ls -la': 'total 48\ndrwxr-xr-x  2 root root 4096 Jan 17\n-rw-r--r--  1 root root  220 Jan 17 flag.txt\n-rw-r--r--  1 root root  512 Jan 17 secret.txt',
            'cat flag.txt': 'FLAG{you_are_the_hacker_champion}',
            'find / -name secret': '/home/secret.txt\n/root/secret.cfg\n/var/log/secret.log',
            'pwd': '/home/hacker',
            'whoami': 'root',
            'ifconfig': 'eth0: inet 192.168.1.100  netmask 255.255.255.0\nlo: inet 127.0.0.1',
            'ps aux': 'root  1234  /bin/bash\nroot  5678  /usr/bin/python3',
            'netstat -an': 'tcp  LISTEN  192.168.1.100:22\ntcp  ESTABLISHED  192.168.1.100:443',
            'echo hacking': 'hacking',
            'help': 'コマンド一覧: ls, cat, find, pwd, whoami, ifconfig, ps, netstat, echo',
        };
        
        // 完全一致
        if (responses[command]) {
            return responses[command];
        }
        
        // 部分一致
        for (const [cmd, response] of Object.entries(responses)) {
            if (command.includes(cmd)) {
                return response;
            }
        }
        
        // デフォルト応答
        return `コマンド '${command}' が見つかりません。help でコマンド一覧を表示します。`;
    }
    
    updateBattleStatus() {
        const status = `あなた: ${this.playerCommandCount} | 相手: ${this.opponentCommandCount}`;
        this.battleInfo.textContent = status;
    }
    
    printOutput(text, element = this.playerOutput) {
        const line = document.createElement('span');
        line.textContent = text;
        element.appendChild(line);
        element.scrollTop = element.scrollHeight;
    }
}

// ページ読み込み時にバトルを初期化
document.addEventListener('DOMContentLoaded', () => {
    new BattleArena();
});
