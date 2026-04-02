import requests

import html2text
from django.http import HttpResponseBadRequest
from ninja_extra.exceptions import ParseError as BadRequest
from django.conf import settings

from api.models import Album


LINK_NAMES = {
    'spotify': 'Spotify',
    'appleMusic': 'Apple Music',
    'yandex': 'Я.Музыка',
    'bandcamp': 'Bandcamp'
}


def compose_telegram(instance):
    """Returns text with HTML formatting for Telegram."""
    result = ''
    for album in instance.albums.all().order_by('index'):
        title = (
            f'<a href="https://albumsweekly.com/album/{album.id}">{album.band_name} — '
            f'{album.album_name}</a>'
        )
        result += f'<p>{title}</p><p>{album.text}<br></p>'
    if instance.text:
        result += f'<p>{instance.text}</p>'
    return result


def compose_album_tg(album: Album):
    links_list = []
    for key, name in LINK_NAMES.items():
        if key in album.links:
            links_list.append(
                f'<a href="{album.links[key]["url"]}">{name}</a>'
            )
    links = ''
    for index in range(len(links_list)):
        if index == len(links_list) - 1:
            links += f'{links_list[index]}'
        else:
            links += f'{links_list[index]} | '

    return (
        f'<a href="{settings.BASE_URL}/album/{album.id}">'
        f'{album.band_name} — {album.album_name}</a>'
        f'<br>'
        f'{album.text}'
        f'<br>'
        f'{links}'
    )


def compose_substack(instance):
    """Returns text with substack formatting.
    """
    result = f'{instance.title}\n\n'
    for album in instance.albums.all().order_by('index'):
        title = f'''<h2><a href="https://albumsweekly.com/album/{album.id}">
        {album.band_name} — {album.album_name}
        </a></h2><br>'''
        result += f'<p>{title}{album.text}</p>{album.spotify_url}'
    return result


def get_songlink_data(url):
    """Returns data from songlink.

    Bad request is raised if there are no spotify data.

    Return: {
        songlink_url,
        links,
        band_name,
        album_name,
        image_url
    }
    """
    response = requests.get(
        f'https://api.song.link/v1-alpha.1/links?url={url}&userCountry=RU'
    )
    if not response or response.status_code != 200:
        raise BadRequest(
            'Songlink doesn\'t response, try again.'
        )
    data = response.json()
    band_name = ''
    album_name = ''
    image_url = ''
    for key in data['entitiesByUniqueId']:
        if 'SPOTIFY' in key:
            band_name = data['entitiesByUniqueId'][key]['artistName']
            album_name = data['entitiesByUniqueId'][key]['title']
            image_url = data['entitiesByUniqueId'][key]['thumbnailUrl']
            return {
                'url': data['pageUrl'],
                'links': data['linksByPlatform'],
                'band_name': band_name,
                'album_name': album_name,
                'image_url': image_url
            }
    raise HttpResponseBadRequest('No spotify data found')


# musicapi.com source identifiers for the services we care about
_MUSICAPI_SOURCES = [
    'spotify',
    'yandexMusic',
    'appleMusic',
    'tidal',
    'deezer',
    'youtubeMusic'
]

# Map musicapi source names → internal link keys (matching LINK_NAMES above)
_MUSICAPI_SOURCE_MAP = {
    'spotify': 'spotify',
    'yandexMusic': 'yandex',
    'appleMusic': 'appleMusic',
    'tidal': 'tidal',
    'deezer': 'deezer',
    'youtubeMusic': 'youtubeMusic',

}

_MUSICAPI_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}


def _musicapi_headers():
    return {
        **_MUSICAPI_HEADERS,
        'Authorization': f'Token {settings.MUSICAPI_KEY}'
    }


def get_album_info_from_musicapi(spotify_url: str) -> dict:
    """Inspects a Spotify album URL via MusicAPI and returns band_name,
    album_name and image_url.
    """
    response = requests.post(
        'https://api.musicapi.com/public/inspect/url',
        json={'url': spotify_url},
        headers=_musicapi_headers(),
    )
    if not response or response.status_code != 200:
        raise BadRequest('MusicAPI inspect request failed.')
    data = response.json()
    if data.get('status') != 'success':
        raise BadRequest('MusicAPI inspect returned a non-success status.')
    item = data['data']
    return {
        'band_name': item['artistNames'][0] if item.get('artistNames') else '',
        'album_name': item['name'],
        'image_url': item.get('imageUrl', ''),
    }


def search_album_on_services(
    band_name: str,
    album_name: str,
    spotify_url: str = ''
) -> dict:
    """Searches for an album on Spotify, Yandex Music, Apple Music, Tidal and
    Deezer via MusicAPI. Returns the same schema as get_songlink_data.
    """
    response = requests.post(
        'https://api.musicapi.com/public/search',
        json={
            'album': album_name,
            'artist': band_name,
            'type': 'album',
            'sources': _MUSICAPI_SOURCES,
        },
        headers=_musicapi_headers(),
    )
    print(response.json())
    if not response or response.status_code != 200:
        raise BadRequest('MusicAPI search request failed.')

    body = response.json()
    # The API returns results under 'tracks' regardless of the requested type
    results = body.get('tracks') or body.get('albums') or []

    links = {}
    image_url = ''
    main_url = spotify_url

    for result in results:
        if result.get('status') != 'success':
            continue
        source = result.get('source', '')
        key = _MUSICAPI_SOURCE_MAP.get(source)
        if not key:
            continue
        item = result.get('data', {})
        links[key] = {'url': item.get('url', '')}
        if source == 'spotify':
            image_url = item.get('imageUrl', image_url)
            if not main_url:
                main_url = item.get('url', '')

    return {
        'url': main_url,
        'links': links,
        'band_name': band_name,
        'album_name': album_name,
        'image_url': image_url,
    }


def convert_to_markdown(text):
    markdown_handler = html2text.HTML2Text()
    markdown_handler.ignore_images = True
    markdown_handler.body_width = 0
    markdown = markdown_handler.handle(text)
    return markdown
