import time
from http import HTTPStatus

from django.utils import timezone

from api.models import Album, Post
from api.tests.base import BaseApiTestCase

PUBLISHED_ALBUMS = 3
ALL_ALBUMS = 5
POSTS = 2


class AlbumApiTestCase(BaseApiTestCase):
    def setUp(self):
        super().setUp()
        self.albums: list[Album] = []
        self.spotify_url = 'https://open.spotify.com/album/0t6tusoh1iWAYXmI4ER144?si=2fb14e7131b246b1'  # noqa
        for i in range(1, 6):
            is_published = True if i < 4 else False
            album = Album.objects.create(
                text=f"Sample text for album {i}",
                spotify_url=self.spotify_url,
                url="https://album.link/s/0t6tusoh1iWAYXmI4ER144",
                image_url="/media/album_covers/actress-.jpeg",
                band_name=f"Band {i}",
                album_name=f"Album {i}",
                is_published=is_published,
                pub_date=timezone.now(),
                links={}
            )
            self.albums.append(album)
        self.post_one = Post.objects.create(
            title='Post one',
            pub_date=timezone.now(),
            is_published=True,
            text='Post one content'
        )
        self.post_two = Post.objects.create(
            title='Post two',
            pub_date=timezone.now(),
            is_published=True,
            text='Post two content'
        )

    def tearDown(self) -> None:
        for album in self.albums:
            album.delete()
        self.post_one.delete()
        self.post_two.delete()

    def test_get_albums(self):
        response = self.client.get(
            '/api/albums',
            **self.headers
        )
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.json()), ALL_ALBUMS)

    def test_get_single_album(self):
        album = self.albums[0]
        response = self.client.get(
            f'/api/albums/{album.pk}',
            **self.headers
        )
        self.assertEqual(response.status_code, HTTPStatus.OK)

    def test_get_songlink_data(self):
        response = self.client.post(
            f'/api/albums/songlink?url={self.spotify_url}',
            **self.headers
        )
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.json()['album_name'], 'All good?')
        time.sleep(10)

    def test_create_album(self):
        response = self.client.post(
            f'/api/albums/songlink?url={self.spotify_url}',
            **self.headers
        ).json()
        new_album = {
            "text": "Sample text for album 6",
            "spotify_url": "https://open.spotify.com/album/0t6tusoh1iWAYXmI4ER144?si=2fb14e7131b246b1",  # noqa
            "url": response['url'],
            "image_url": response['image_url'],
            "band_name": response['band_name'],
            "album_name": response['album_name'],
            "is_published": False,
            "pub_date": timezone.now(),
            "links": response['links']
        }

        album_response = self.client.post(
            '/api/albums/create',
            data=new_album,
            content_type='application/json',
            **self.headers

        )
        self.assertEqual(album_response.status_code, HTTPStatus.CREATED)
        self.assertEqual(len(Album.objects.all()), ALL_ALBUMS + 1)
