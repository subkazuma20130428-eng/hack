#!/usr/bin/env python
"""
Hacker Typer Game - 動作確認テスト
"""

import os
import sys
import subprocess

def check_python():
    """Python バージョンをチェック"""
    print("✓ Python バージョン確認中...")
    if sys.version_info < (3, 8):
        print(f"✗ エラー: Python 3.8+ が必要です（現在: {sys.version}）")
        return False
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} が インストールされています")
    return True

def check_django():
    """Django がインストールされているか確認"""
    print("\n✓ Django インストール確認中...")
    try:
        import django
        print(f"✓ Django {django.VERSION} が インストールされています")
        return True
    except ImportError:
        print("✗ Django がインストールされていません")
        print("  インストール: pip install django")
        return False

def check_project_structure():
    """プロジェクト構造をチェック"""
    print("\n✓ プロジェクト構造確認中...")
    required_files = [
        'manage.py',
        'game/views.py',
        'game/urls.py',
        'hacker_typer/settings.py',
        'game/templates/game/index.html',
        'game/static/game/game.js',
    ]
    
    missing = []
    for file in required_files:
        if not os.path.exists(file):
            missing.append(file)
    
    if missing:
        print("✗ 以下のファイルが見つかりません:")
        for file in missing:
            print(f"  - {file}")
        return False
    
    print(f"✓ すべてのファイルが揃っています（{len(required_files)} ファイル）")
    return True

def check_database():
    """データベースをチェック"""
    print("\n✓ データベース確認中...")
    if not os.path.exists('db.sqlite3'):
        print("  データベースを初期化中...")
        try:
            subprocess.run([sys.executable, 'manage.py', 'migrate', '--quiet'], 
                          check=True, capture_output=True)
            print("✓ データベースが初期化されました")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ データベース初期化エラー: {e}")
            return False
    else:
        print("✓ データベースファイルが存在します")
        return True

def check_static_files():
    """静的ファイルをチェック"""
    print("\n✓ 静的ファイル確認中...")
    if not os.path.exists('game/static/game/game.js'):
        print("✗ game.js が見つかりません")
        return False
    if not os.path.exists('game/static/game/style.css'):
        print("✗ style.css が見つかりません")
        return False
    print("✓ 静的ファイルが揃っています")
    return True

def main():
    print("=" * 50)
    print("  🎮 Hacker Typer Game - 動作確認テスト")
    print("=" * 50)
    
    checks = [
        ("Python", check_python),
        ("Django", check_django),
        ("プロジェクト構造", check_project_structure),
        ("データベース", check_database),
        ("静的ファイル", check_static_files),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"✗ {name} チェックエラー: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 50)
    print("  テスト結果")
    print("=" * 50)
    
    all_passed = True
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
        if not result:
            all_passed = False
    
    print("=" * 50)
    
    if all_passed:
        print("\n✓ すべてのテストに合格しました！")
        print("\nゲームを起動する:")
        print("  python start_game.py")
        print("\nまたは:")
        print("  python manage.py runserver")
        return 0
    else:
        print("\n✗ いくつかのテストに失敗しました")
        print("\n修正方法:")
        print("  1. Python 3.8+ をインストール")
        print("  2. pip install django")
        print("  3. python manage.py migrate")
        return 1

if __name__ == '__main__':
    sys.exit(main())
