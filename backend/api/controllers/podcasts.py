import logging

from ninja_extra import api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja_extra.permissions import IsAdminUser
from django.shortcuts import get_object_or_404

from api.models import Podcast
from api.schemas import PodcastSchema, PodcastCreateSchema

logger = logging.getLogger(__name__)

@api_controller('/podcasts', auth=JWTAuth(), permissions=[IsAdminUser])
class PodcastController:

    @route.post('/create', response=PodcastSchema)
    def create_text(self, request, payload: PodcastCreateSchema):
        text = Podcast.objects.create(**payload.dict())
        return text

    @route.get('', response=list[PodcastSchema])
    def get_texts(self, request):
        podcasts = Podcast.objects.all()
        return podcasts

    @route.get('/{id}', response=PodcastSchema)
    def get_text(self, request, id: int):
        podcast = get_object_or_404(Podcast, pk=id)
        return podcast

    @route.put('/{id}', response=PodcastSchema)
    def update_text(self, request, id: int, payload: PodcastCreateSchema):
        payload = payload.dict()
        podcast = get_object_or_404(Podcast, pk=id)
        for key, value in payload.items():
            setattr(podcast, key, value)
        podcast.save()
        return podcast

    @route.delete('/{id}')
    def gelete_text(self, request, id: int):
        podcast = get_object_or_404(Podcast, pk=id)
        podcast.delete()
        return
