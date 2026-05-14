from http import HTTPStatus
from unittest.mock import Mock, patch

from django.conf import settings
from django.utils import timezone

from api.models import Album, Post
from api.tests.base import BaseApiTestCase
from api.utils import get_album_multilink_data

PUBLISHED_ALBUMS = 3
ALL_ALBUMS = 5
POSTS = 2
MULTILINK_RESPONSE = {
    'spotifyUrl': (
        'https://open.spotify.com/album/0uSqVX1YenAjy2x8VRtpVq'
        '?si=LZt2eQilS4yaZQSyZfym3g'
    ),
    'appleMusicUrl': (
        'https://music.apple.com/ru/album/'
        '%D0%BC%D0%B8%D0%BA%D1%82%D0%BB%D0%B0%D0%BD/6766955110'
    ),
    'deezerUrl': 'https://www.deezer.com/album/972110281',
    'tidalUrl': 'https://tidal.com/browse/album/520103944',
    'imageUrl': (
        'https://i.scdn.co/image/ab67616d00001e02c41d27e3d2d2fbab7220c750'
    ),
    'albumName': 'миктлан',
    'artistName': 'миктлан',
}
MULTILINK_DATA = {
    'url': MULTILINK_RESPONSE['spotifyUrl'],
    'links': {
        'spotify': {'url': MULTILINK_RESPONSE['spotifyUrl']},
        'appleMusic': {'url': MULTILINK_RESPONSE['appleMusicUrl']},
        'deezer': {'url': MULTILINK_RESPONSE['deezerUrl']},
        'tidal': {'url': MULTILINK_RESPONSE['tidalUrl']},
    },
    'band_name': MULTILINK_RESPONSE['artistName'],
    'album_name': MULTILINK_RESPONSE['albumName'],
    'image_url': MULTILINK_RESPONSE['imageUrl'],
}


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

    @patch('api.utils.requests.get')
    def test_get_album_multilink_data(self, mock_get):
        mock_get.return_value = Mock(status_code=HTTPStatus.OK)
        mock_get.return_value.json.return_value = MULTILINK_RESPONSE

        response = get_album_multilink_data(self.spotify_url)

        self.assertEqual(response, MULTILINK_DATA)
        mock_get.assert_called_once_with(
            'https://albumsweekly.com/links/get_links',
            params={'spotifyUrl': self.spotify_url},
            headers={
                'Accept': 'application/json',
                'Authorization': settings.MULTILINK_KEY,
            },
            timeout=30,
        )

    def test_get_songlink_data(self):
        with patch(
            'api.controllers.albums.get_album_multilink_data',
            return_value=MULTILINK_DATA
        ):
            response = self.client.post(
                f'/api/albums/songlink?url={self.spotify_url}',
                **self.headers
            )
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.json()['album_name'],
            MULTILINK_DATA['album_name'],
        )

    def test_create_album(self):
        with patch(
            'api.controllers.albums.get_album_multilink_data',
            return_value=MULTILINK_DATA
        ):
            response = self.client.post(
                f'/api/albums/songlink?url={self.spotify_url}',
                **self.headers
            ).json()
        new_album = {
            "text": "Sample text for album 6",
            "spotify_url": (
                'https://open.spotify.com/album/0t6tusoh1iWAYXmI4ER144'
                '?si=2fb14e7131b246b1'
            ),
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
