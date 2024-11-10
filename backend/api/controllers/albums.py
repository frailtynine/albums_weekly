import logging

from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from ninja_extra import api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja_extra.permissions import IsAdminUser

from api.models import Album
from api.schemas import (
    AlbumSchema,
    SonglinkResponse,
    AlbumCreateSchema
)
from api.utils import get_songlink_data

logger = logging.getLogger(__name__)


@api_controller('/albums', auth=JWTAuth(), permissions=[IsAdminUser])
class AlbumController:

    @route.post('/songlink', response=SonglinkResponse)
    def get_songlink(self, request, url: str):
        songlink_data = get_songlink_data(url)
        return songlink_data

    @route.post('/create', response={201: AlbumSchema})
    def create_album(self, request, item: AlbumCreateSchema):
        payload = item.dict()
        if not payload['text'] or not payload['band_name']:
            raise HttpError(400, 'fields are missing')
        album = Album.objects.create(**payload)
        return album

    @route.get(
        '', response=list[AlbumSchema]
    )
    def get_albums(self, request):
        albums = Album.objects.all().order_by('-pub_date')
        return albums

    @route.get('/{id}', response=AlbumSchema)
    def get_album(self, request, id: int):
        album = get_object_or_404(Album, pk=id)
        return album

    @route.put('/{id}', response=AlbumSchema)
    def update_album(self, request, id: int, item: AlbumCreateSchema):
        payload = item.dict()
        album = get_object_or_404(Album, pk=id)
        for key, value in payload.items():
            setattr(album, key, value)
        album.save()
        return album

    @route.delete('/{id}')
    def delete_album(self, request, id: int):
        album = get_object_or_404(Album, pk=id)
        album.delete()
        return
