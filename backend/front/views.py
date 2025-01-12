from itertools import chain

from django.views.generic import DetailView, ListView, TemplateView

from api.models import (
    Podcast,
    Album,
    Text,
    AlbumViewCount,
)
from front.utils import increase_counter


PAGINATE_ALBUMS = 10
PAGINATE_INDEX = 10


class IndexView(ListView):
    template_name = 'pages/index.html'
    paginate_by = PAGINATE_INDEX

    def get_queryset(self):
        albums = Album.objects.filter(is_published=True)
        for album in albums:
            increase_counter(album, AlbumViewCount)
        podcasts = Podcast.objects.filter(is_published=True)
        texts = Text.objects.filter(is_published=True)

        combined_list = sorted(
            chain(albums, podcasts, texts),
            key=lambda instance: instance.pub_date,
            reverse=True
        )
        return combined_list


class PodcastDetailView(DetailView):
    model = Podcast
    queryset = Podcast.objects.filter(
        is_published=True,
    )
    template_name = 'pages/podcast_detail.html'


class PodcastListView(ListView):
    model = Podcast
    queryset = Podcast.objects.filter(
        is_published=True
    ).order_by('-pub_date')
    template_name = 'pages/podcast_list.html'
    paginate_by = PAGINATE_ALBUMS


class AlbumDetailView(DetailView):
    model = Album
    queryset = Album.objects.filter(
        is_published=True,
    )
    template_name = 'pages/album_detail.html'

    def get_object(self, ):
        object = super().get_object(self.get_queryset())
        increase_counter(object, AlbumViewCount)
        return object


class AlbumListView(ListView):
    model = Album
    queryset = Album.objects.filter(
        is_published=True,
    ).order_by('-pub_date')
    template_name = 'pages/album_list.html'
    paginate_by = PAGINATE_ALBUMS


class TextDetailView(DetailView):
    model = Text
    queryset = Text.objects.filter(
        is_published=True,
    )
    template_name = 'pages/text_detail.html'


class TextListView(ListView):
    model = Text
    queryset = Text.objects.filter(
        is_published=True,
    ).order_by('-pub_date')
    template_name = 'pages/text_list.html'
    paginate_by = PAGINATE_ALBUMS


class AboutView(TemplateView):
    template_name = 'pages/about.html'
