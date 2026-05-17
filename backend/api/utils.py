import requests

import html2text
from django.http import HttpResponseBadRequest
from ninja_extra.exceptions import ParseError as BadRequest
from django.conf import settings

from api.models import Album


LINK_NAMES = {
    'spotify': 'Spotify',
    'tidal': 'Tidal',
    'deezer': 'Deezer',
    'appleMusic': 'Apple Music',
    'yandex': 'Я.Музыка',
    'bandcamp': 'Bandcamp'
}


def compose_telegram(instance):
    """Returns text with HTML formatting for Telegram."""
    result = ''
    for album in instance.albums.all().order_by('index'):
        title = (
            f'<a href="https://albumsweekly.com/album/{album.id}">'
            f'{album.band_name} — '
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


_MULTILINK_SOURCE_MAP = {
    'spotifyUrl': 'spotify',
    'appleMusicUrl': 'appleMusic',
    'deezerUrl': 'deezer',
    'tidalUrl': 'tidal',
}

_MULTILINK_HEADERS = {
    'Accept': 'application/json',
}


def _multilink_headers():
    return {
        **_MULTILINK_HEADERS,
        'Authorization': settings.MULTILINK_KEY,
    }


def get_album_multilink_data(spotify_url: str) -> dict:
    """Returns album metadata and streaming links for a Spotify album URL."""
    response = requests.get(
        'https://albumsweekly.com/links/get_links',
        params={'url': spotify_url},
        headers=_multilink_headers(),
        timeout=30,
    )
    if not response or response.status_code != 200:
        raise BadRequest('Multilink request failed.')

    data = response.json()

    links = {}
    for response_key, link_key in _MULTILINK_SOURCE_MAP.items():
        link_url = data.get(response_key)
        if link_url:
            links[link_key] = {'url': link_url}

    return {
        'url': data.get('spotifyUrl', spotify_url),
        'links': links,
        'band_name': data.get('artistName', ''),
        'album_name': data.get('albumName', ''),
        'image_url': data.get('imageUrl', ''),
    }


def convert_to_markdown(text):
    markdown_handler = html2text.HTML2Text()
    markdown_handler.ignore_images = True
    markdown_handler.body_width = 0
    markdown = markdown_handler.handle(text)
    return markdown
