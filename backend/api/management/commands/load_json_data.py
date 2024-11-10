import os
import json
import time
from datetime import datetime

from django.core.management.base import BaseCommand
from django.conf import settings

from api.models import Post, Album, Podcast, Text
from api.utils import get_songlink_data


class Command(BaseCommand):
    help = 'Load Post and Album data from JSON to database'

    def load_json_file(self, file_name):
        file_path = os.path.join(
            settings.BASE_DIR,
            'fixtures',
            file_name
        )
        try:
            with open(file_path, 'r') as file:
                return json.load(file)
        except FileNotFoundError:
            self.stderr.write(f"Error: The file '{file_path}' does not exist.")
            return None

    def handle(self, *args, **kwargs):
        if Post.objects.all() or Album.objects.all() or Podcast.objects.all():
            self.stdout.write('Empty database first')
            return
        posts_json = self.load_json_file('albums_post.json')
        albums_json = self.load_json_file('albums_album.json')
        podcasts_json = self.load_json_file('albums_podcast.json')
        texts_json = self.load_json_file('albums_text.json')
        for post in posts_json['albums_post']:
            Post.objects.create(
                title=post['title'],
                pub_date=datetime.strptime(
                    post['pub_date'],
                    '%Y-%m-%d'
                ).date(),
                is_published=post['is_published'],
                id=post['id']
            )
        for album in albums_json['albums_album']:
            post = Post.objects.get(
                pk=album['post_id']
            )

            songlink_data = get_songlink_data(album['spotify_url'])
            new_album = Album.objects.create(
                text=album['text'],
                spotify_url=album['spotify_url'],
                url=songlink_data['songlink_url'],
                band_name=songlink_data['band_name'],
                album_name=songlink_data['album_name'],
                image_url=songlink_data['image_url'],
                links=songlink_data['links'],
                pub_date=datetime.strptime(
                    album['pub_date'],
                    '%Y-%m-%d'
                ).date(),
                is_published=album['is_published'],
                post=post
            )
            print(new_album, ' added to DB')
            time.sleep(5)

        for podcast in podcasts_json['albums_podcast']:
            Podcast.objects.create(
                title=podcast['title'],
                yt_id=podcast['yt_id'],
                text=podcast['text'],
                pub_date=datetime.strptime(
                    podcast['pub_date'],
                    '%Y-%m-%d'
                ).date(),
                is_published=podcast['is_published']
            )

        for text in texts_json['albums_text']:
            Text.objects.create(
                title=text['title'],
                pub_date=datetime.strptime(
                    text['pub_date'],
                    '%Y-%m-%d'
                ).date(),
                id=text['id'],
                content=text['content'],
                is_published=text['is_published']
            )

        print(
            f'Posts added: {Post.objects.count()}. \n'
            f'Albums added: {Album.objects.count()}. \n'
            f'Podcasts added: {Podcast.objects.count()}. \n'
            f'Texts added: {Text.objects.count()}.'
        )
        return
