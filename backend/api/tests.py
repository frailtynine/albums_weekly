from datetime import datetime
from http import HTTPStatus

from django.test import TestCase
from django.contrib.auth import get_user_model

from api.models import Album

PUBLISHED_ALBUMS = 3
ALL_ALBUMS = 5


# TODO: Write auth mechanics
class AlbumApiTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.superuser = User.objects.create_superuser(
            username='admin',
            password='admin',
            email='admin@admin.com'
        )
        self.client.login(username='admin', password='admin')
        self.albums: list[Album] = []
        for i in range(1, 6):
            is_published = True if i < 4 else False
            album = Album.objects.create(
                text=f"Sample text for album {i}",
                spotify_url="https://open.spotify.com/album/0t6tusoh1iWAYXmI4ER144?si=2fb14e7131b246b1",  # noqa
                url="https://album.link/s/0t6tusoh1iWAYXmI4ER144",
                image_url="https://i.scdn.co/image/ab67616d0000b27391ee478e77656d017787ed3e", # noqa
                embed_code='<iframe width="100%" height="52" src="https://odesli.co/embed/?url=https%3A%2F%2Falbum.link%2Fs%2F0t6tusoh1iWAYXmI4ER144&theme=light" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox" allow="clipboard-read; clipboard-write"></iframe>',   # noqa
                band_name=f"Band {i}",
                album_name=f"Album {i}",
                is_published=is_published,
                pub_date=datetime.now()
            )
            self.albums.append(album)

    def tearDown(self) -> None:
        for album in self.albums:
            album.delete()

    def test_get_albums(self):
        response = self.client.get('/api/albums')
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.json()), PUBLISHED_ALBUMS)

    def test_get_single_album(self):
        published_album = self.albums[0]
        response = self.client.get(f'/api/albums/{published_album.pk}')
        self.assertEqual(response.status_code, HTTPStatus.OK)

    # def test_create_album(self):
    #     album_data_no_url = {
    #         'text': 'test text some other text text',
    #         'band_name': 'Created Band',
    #         'album_name': 'Created Album'
    #     }
    #     response = self.client.post(
    #         '/api/albums/create',
    #         data=album_data_no_url,
    #         content_type='application/json'

    #     )
    #     self.assertEqual(response.status_code, HTTPStatus.CREATED)
    #     self.assertEqual(len(Album.objects.all()), ALL_ALBUMS + 1)
