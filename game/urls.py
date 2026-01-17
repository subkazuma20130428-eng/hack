from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('battle/', views.battle, name='battle'),
    path('api/get-word/', views.get_word, name='get_word'),
    path('api/submit-score/', views.submit_score, name='submit_score'),
    path('api/send-chat/', views.send_chat_message, name='send_chat'),
    path('api/get-chat/', views.get_chat_messages, name='get_chat'),
    path('api/register/', views.register_account, name='register'),
    path('api/login/', views.login_account, name='login'),
    path('api/logout/', views.logout_account, name='logout'),
    path('api/find-opponent/', views.find_opponent, name='find_opponent'),
    path('api/battle-command/', views.battle_command, name='battle_command'),
    path('api/get-opponent-commands/', views.get_opponent_commands, name='get_opponent_commands'),
    path('api/update-player-typing/', views.update_player_typing, name='update_player_typing'),
    path('api/get-opponent-typing/', views.get_opponent_typing, name='get_opponent_typing'),
]
