from django.urls import path
from .views import dijkstra_api, astar_api

urlpatterns = [
    path('dijkstra/', dijkstra_api, name='dijkstra_api'),
    path('astar/', astar_api, name='astar_api')
]