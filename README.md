# Render でのデプロイ手順

1. Render.com で新規 Web Service を作成
   - リポジトリをGitHub等から連携
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn hacker_typer.wsgi:application`
   - Pythonバージョン: 3.10 以上推奨

2. 環境変数
   - `DJANGO_SETTINGS_MODULE=hacker_typer.settings`
   - `SECRET_KEY` など必要に応じて追加

3. データベース
   - RenderのPostgreSQLを利用する場合、環境変数`DATABASE_URL`が自動で設定されます
   - settings.pyは自動で切り替わるよう対応済み

4. 静的ファイル
   - `python manage.py collectstatic` はRenderが自動実行

5. その他
   - .render.yaml, Procfile, requirements.txt もコミット
   - ALLOWED_HOSTSにRenderのドメインを追加

詳細は公式ドキュメントも参照してください。
