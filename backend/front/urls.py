from django.urls import path

from front.views import (
    IndexView,
    PodcastDetailView,
    AlbumDetailView,
    AlbumListView,
    PodcastListView,
    TextDetailView,
    TextListView,
    AboutView
)

urlpatterns = [
    path(
        'podcast/<int:pk>',
        PodcastDetailView.as_view(),
        name='podcast_detail'
    ),
    path(
        'album/<int:pk>',
        AlbumDetailView.as_view(),
        name='album_detail'
    ),
    path(
        'albums',
        AlbumListView.as_view(),
        name='album_list'
    ),
    path(
        'podcasts',
        PodcastListView.as_view(),
        name='podcast_list'
    ),
    path(
        'texts/<int:pk>',
        TextDetailView.as_view(),
        name='text_detail'
    ),
    path(
        'texts',
        TextListView.as_view(),
        name='text_list'
    ),
    path(
        'about',
        AboutView.as_view(),
        name='about'
    ),
    path('', IndexView.as_view(), name='index')
]
