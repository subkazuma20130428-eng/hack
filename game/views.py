from django.shortcuts import render
from django.http import JsonResponse
import json
from datetime import datetime

# グローバルチャットメモリ（本番環境ではデータベースを使用すること）
chat_messages = []
accounts = {
    'masumc': {
        'password': 'kazuma20130412@@',
        'created_at': datetime.now().isoformat()
    }
}  # アカウント管理用

# バトル機能用のメモリ
waiting_players = []  # マッチング待機中のプレイヤー
active_battles = {}   # 進行中のバトル

# ハッキング用のサンプルコマンド
HACKING_COMMANDS = [
    "nmap -sV 192.168.1.1",
    "sqlmap -u http://target.com --dbs",
    "john --wordlist=rockyou.txt hashes.txt",
    "hashcat -m 1000 -a 0 hashes.txt rockyou.txt",
    "metasploit > set RHOSTS 192.168.1.0/24",
    "aircrack-ng -w rockyou.txt -b BSSID capture.cap",
    "gobuster dir -u http://target.com -w wordlist.txt",
    "wireshark -i eth0 -k",
    "tcpdump -i eth0 -w capture.pcap",
    "ssh-keygen -t rsa -N '' -f ~/.ssh/id_rsa",
]

def index(request):
    """ゲームのメインページ"""
    return render(request, 'game/index.html')

def battle(request):
    """バトル画面 - ログインが必須"""
    # セッションからプレイヤー名を確認
    player_name = request.session.get('player_name')
    if not player_name:
        # ログインしていなければログイン画面にリダイレクト
        return render(request, 'game/index.html', {'error': 'ログインが必要です'})
    
    return render(request, 'game/battle.html')

def get_word(request):
    """ゲーム開始時にランダムなコマンドを返す"""
    import random
    command = random.choice(HACKING_COMMANDS)
    return JsonResponse({'command': command})

def submit_score(request):
    """スコアを受け取る"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            wpm = data.get('wpm', 0)
            accuracy = data.get('accuracy', 0)
            time_taken = data.get('time_taken', 0)
            
            # ここでスコアをデータベースに保存することもできます
            return JsonResponse({
                'status': 'success',
                'message': 'スコアを保存しました'
            })
        except:
            return JsonResponse({'status': 'error'}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def send_chat_message(request):
    """チャットメッセージを送信"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message = data.get('message', '').strip()
            player_name = data.get('player_name', 'Anonymous')
            
            if not message:
                return JsonResponse({'status': 'error', 'message': 'メッセージが空です'}, status=400)
            
            # メッセージを保存
            chat_msg = {
                'player_name': player_name,
                'message': message,
                'timestamp': datetime.now().isoformat()
            }
            chat_messages.append(chat_msg)
            
            # 最後の100件のみ保存
            if len(chat_messages) > 100:
                chat_messages.pop(0)
            
            return JsonResponse({
                'status': 'success',
                'message_data': chat_msg
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def get_chat_messages(request):
    """チャットメッセージを取得"""
    try:
        limit = int(request.GET.get('limit', 50))
        messages = chat_messages[-limit:]
        return JsonResponse({
            'status': 'success',
            'messages': messages
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

def register_account(request):
    """アカウント登録"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            
            if not username or not password:
                return JsonResponse({'status': 'error', 'message': 'ユーザー名とパスワードを入力してください'}, status=400)
            
            if username in accounts:
                return JsonResponse({'status': 'error', 'message': 'このユーザー名は既に使用されています'}, status=400)
            
            # アカウント登録
            accounts[username] = {
                'password': password,
                'created_at': datetime.now().isoformat()
            }
            
            return JsonResponse({
                'status': 'success',
                'message': 'アカウントを作成しました',
                'username': username
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def login_account(request):
    """アカウントログイン"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            
            if not username or not password:
                return JsonResponse({'status': 'error', 'message': 'ユーザー名とパスワードを入力してください'}, status=400)
            
            if username not in accounts:
                return JsonResponse({'status': 'error', 'message': 'ユーザー名またはパスワードが違います'}, status=400)
            
            if accounts[username]['password'] != password:
                return JsonResponse({'status': 'error', 'message': 'ユーザー名またはパスワードが違います'}, status=400)
            
            # ログイン成功時にセッションに保存
            request.session['player_name'] = username
            request.session.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'ログインしました',
                'username': username
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def logout_account(request):
    """アカウントログアウト"""
    if request.method == 'POST':
        try:
            # セッションをクリア
            if 'player_name' in request.session:
                del request.session['player_name']
            request.session.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'ログアウトしました'
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

# バトルシステム用グローバル変数
active_battles = {}  # バトルセッション管理
waiting_players = []  # マッチング待機中のプレイヤー

def find_opponent(request):
    """対戦相手を探す"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            player_name = data.get('player_name')
            
            if not player_name:
                return JsonResponse({'status': 'error', 'message': 'プレイヤー名が必要です'}, status=400)
            
            # 待機中のプレイヤーがいるか確認（自分以外）
            opponent = None
            if waiting_players:
                # 自分以外の待機プレイヤーを探す
                for i, player in enumerate(waiting_players):
                    if player != player_name:
                        opponent = waiting_players.pop(i)
                        break
            
            if opponent:
                # マッチング成功
                battle_id = f"{player_name}_{opponent}_{datetime.now().timestamp()}"
                
                # バトルセッション作成
                active_battles[battle_id] = {
                    'player1': player_name,
                    'player2': opponent,
                    'player1_commands': [],
                    'player2_commands': [],
                    'player1_typing': '',
                    'player2_typing': '',
                    'started_at': datetime.now().isoformat()
                }
                
                return JsonResponse({
                    'status': 'found',
                    'battle_id': battle_id,
                    'opponent': opponent
                })
            else:
                # 自分を待機プレイヤーに追加（重複は避ける）
                if player_name not in waiting_players:
                    waiting_players.append(player_name)
                
                return JsonResponse({
                    'status': 'waiting',
                    'message': 'マッチング待機中...'
                })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def battle_command(request):
    """バトルコマンド送信"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            battle_id = data.get('battle_id')
            player_name = data.get('player_name')
            command = data.get('command')
            
            if battle_id not in active_battles:
                return JsonResponse({'status': 'error', 'message': 'バトルが見つかりません'}, status=400)
            
            battle = active_battles[battle_id]
            
            # プレイヤーのコマンドを保存
            if player_name == battle['player1']:
                battle['player1_commands'].append({
                    'command': command,
                    'timestamp': datetime.now().isoformat()
                })
            elif player_name == battle['player2']:
                battle['player2_commands'].append({
                    'command': command,
                    'timestamp': datetime.now().isoformat()
                })
            
            return JsonResponse({
                'status': 'success',
                'message': 'コマンドが送信されました'
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def get_opponent_commands(request):
    """相手のコマンドを取得"""
    if request.method == 'GET':
        try:
            battle_id = request.GET.get('battle_id')
            player_name = request.GET.get('player_name')
            
            if battle_id not in active_battles:
                return JsonResponse({'status': 'error', 'message': 'バトルが見つかりません'}, status=400)
            
            battle = active_battles[battle_id]
            
            # 相手のコマンド一覧を取得
            if player_name == battle['player1']:
                opponent_commands = battle['player2_commands']
            else:
                opponent_commands = battle['player1_commands']
            
            return JsonResponse({
                'status': 'success',
                'commands': opponent_commands
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def update_player_typing(request):
    """プレイヤーの入力中のテキストを更新"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            battle_id = data.get('battle_id')
            player_name = data.get('player_name')
            typing_text = data.get('typing_text', '')
            
            if battle_id not in active_battles:
                return JsonResponse({'status': 'error', 'message': 'バトルが見つかりません'}, status=400)
            
            battle = active_battles[battle_id]
            
            # プレイヤーの入力中テキストを保存
            if player_name == battle['player1']:
                battle['player1_typing'] = typing_text
            elif player_name == battle['player2']:
                battle['player2_typing'] = typing_text
            
            return JsonResponse({
                'status': 'success',
                'message': 'テキストが更新されました'
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

def get_opponent_typing(request):
    """相手の入力中のテキストを取得"""
    if request.method == 'GET':
        try:
            battle_id = request.GET.get('battle_id')
            player_name = request.GET.get('player_name')
            
            if battle_id not in active_battles:
                return JsonResponse({'status': 'error', 'message': 'バトルが見つかりません'}, status=400)
            
            battle = active_battles[battle_id]
            
            # 相手の入力中テキストを取得
            if player_name == battle['player1']:
                typing_text = battle.get('player2_typing', '')
            else:
                typing_text = battle.get('player1_typing', '')
            
            return JsonResponse({
                'status': 'success',
                'typing_text': typing_text
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error'}, status=400)

