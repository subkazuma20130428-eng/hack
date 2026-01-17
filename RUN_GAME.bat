@echo off
echo ====================================
echo   Hacker Typer Game - Start Server
echo ====================================
echo.

REM Python がインストールされているか確認
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python がインストールされていません
    exit /b 1
)

echo ✓ Python が検出されました

REM 仮想環境が存在するか確認
if not exist "venv" (
    echo.
    echo 仮想環境を作成しています...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: 仮想環境の作成に失敗しました
        exit /b 1
    )
    echo ✓ 仮想環境が作成されました
)

REM 仮想環境を有効化
echo.
echo 仮想環境を有効化しています...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: 仮想環境の有効化に失敗しました
    exit /b 1
)

REM Django をインストール
echo.
echo 必要なパッケージをインストールしています...
pip install django --quiet
if %errorlevel% neq 0 (
    echo ERROR: Django のインストールに失敗しました
    exit /b 1
)
echo ✓ パッケージがインストールされました

REM データベースマイグレーション
echo.
echo データベースをセットアップしています...
python manage.py migrate --quiet
if %errorlevel% neq 0 (
    echo ERROR: マイグレーションに失敗しました
    exit /b 1
)
echo ✓ データベースがセットアップされました

REM 静的ファイル収集
echo.
echo 静的ファイルを収集しています...
python manage.py collectstatic --noinput --quiet
if %errorlevel% neq 0 (
    echo WARNING: 静的ファイル収集に失敗しました（無視）
)
echo ✓ 静的ファイルの準備完了

REM サーバー起動
echo.
echo ====================================
echo   Django サーバーを起動しています
echo ====================================
echo.
echo ゲームを開く: http://localhost:8000
echo 管理画面: http://localhost:8000/admin
echo.
echo ユーザー名: masumc
echo パスワード: kazuma20130412@@
echo.
echo サーバーを停止するには Ctrl+C を押してください
echo ====================================
echo.

python manage.py runserver 0.0.0.0:8000

pause
