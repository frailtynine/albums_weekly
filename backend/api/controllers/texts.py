import logging

from ninja_extra import api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja_extra.permissions import IsAdminUser
from django.shortcuts import get_object_or_404

from api.models import Text
from api.schemas import TextCreateSchema, TextSchema

logger = logging.getLogger(__name__)

@api_controller('/texts', auth=JWTAuth(), permissions=[IsAdminUser])
class TextController:

    @route.post('/create', response=TextSchema)
    def create_text(self, request, payload: TextCreateSchema):
        text = Text.objects.create(**payload.dict())
        return text

    @route.get('', response=list[TextSchema])
    def get_texts(self, request):
        texts = Text.objects.all()
        return texts

    @route.get('/{id}', response=TextSchema)
    def get_text(self, request, id: int):
        text = get_object_or_404(Text, pk=id)
        return text

    @route.put('/{id}', response=TextSchema)
    def update_text(self, request, id: int, payload: TextCreateSchema):
        payload = payload.dict()
        text = get_object_or_404(Text, pk=id)
        for key, value in payload.items():
            setattr(text, key, value)
        text.save()
        return text

    @route.delete('/{id}')
    def gelete_text(self, request, id: int):
        text = get_object_or_404(Text, pk=id)
        text.delete()
        return
