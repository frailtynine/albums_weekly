import requests
from datetime import datetime

from django.db import models
from django.utils.text import slugify
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


TEXT_TITLE_MAX_LENGTH = 300


class Post(models.Model):
    title = models.CharField('Title',
                             max_length=200,
                             unique=True)
    pub_date = models.DateField('Date',
                                default=datetime.now)
    is_published = models.BooleanField(default=False)
    telegram_content = models.TextField(null=True)
    substack_content = models.TextField(null=True)
    text = models.TextField(null=True)

    class Meta:
        ordering = ('-pub_date',)

    def __str__(self) -> str:
        return f'{self.title} {self.pub_date}'


# TODO: Add slugs with Russian conversion
class Album(models.Model):
    text = models.TextField(
        'Text',
        max_length=1100
    )
    spotify_url = models.URLField('Spotify URL', null=True)
    url = models.URLField('Album URL')
    band_name = models.CharField('Band name', max_length=50)
    album_name = models.CharField('Album name', max_length=100)
    image_url = models.URLField('Image URL')
    links = models.JSONField('Links to streamings')
    post = models.ForeignKey(
        Post,
        on_delete=models.SET_NULL,
        related_name='albums',
        null=True
    )
    is_published = models.BooleanField(default=False)
    pub_date = models.DateField(
        'Date',
        default=datetime.now
    )
    index = models.IntegerField('Index in Post', null=True)

    def save(self, *args, **kwargs):
        if self.image_url.startswith('http'):
            image_name = (
                f'{slugify(self.band_name)}-{slugify(self.album_name)}.jpeg'
            )
            image_response = requests.get(self.image_url)
            if image_response.status_code == 200:
                image_path = default_storage.save(
                    f'album_covers/{image_name}',
                    ContentFile(image_response.content)
                )
                server_image_url = default_storage.url(image_path)
                self.image_url = server_image_url
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'{self.band_name} {self.album_name}'


class Text(models.Model):
    title = models.TextField(
        'Title',
        max_length=TEXT_TITLE_MAX_LENGTH
    )
    pub_date = models.DateField(
        'Date',
        default=datetime.now
    )
    is_published = models.BooleanField(
        'Is published',
        default=False
    )
    content = models.TextField(
        'Text',
        null=True
    )


class Podcast(models.Model):
    yt_id = models.TextField(null=True)
    pub_date = models.DateField(
        'Date',
        default=datetime.now
    )
    title = models.TextField('Title', max_length=TEXT_TITLE_MAX_LENGTH)
    text = models.TextField('Text')
    is_published = models.BooleanField(
        'Published status',
        default=False
    )


class PostViewCount(models.Model):
    object = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='view_count'
    )
    count = models.IntegerField(default=0)

    def __str__(self) -> str:
        return f'{self.object}: {self.count} views'


class AlbumViewCount(models.Model):
    object = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name='view_count'
    )
    count = models.IntegerField(default=0)

    def __str__(self) -> str:
        return f'{self.object}: {self.count} views'
