from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/get-word/', views.get_word, name='get_word'),
    path('api/submit-score/', views.submit_score, name='submit_score'),
    path('api/send-chat/', views.send_chat_message, name='send_chat'),
    path('api/get-chat/', views.get_chat_messages, name='get_chat'),
    path('api/register/', views.register_account, name='register'),
    path('api/login/', views.login_account, name='login'),
    path('api/logout/', views.logout_account, name='logout'),
]
