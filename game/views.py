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


