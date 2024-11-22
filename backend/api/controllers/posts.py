import os
import logging
import zipfile
import asyncio

from django.shortcuts import get_object_or_404
from django.db.models import Prefetch, Sum
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from ninja_extra import api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja_extra.permissions import IsAdminUser
from ninja.errors import HttpError
from telegram.error import BadRequest as TelegramBadRequest

from api.models import Post, Album
from api.schemas import (
    PostSchema,
    PostCreateSchema,
    TelegramText
)
from api.image_generator import generate_images
from api.utils import compose_substack, compose_telegram, convert_to_markdown
from api.telegram import Bot


logger = logging.getLogger(__name__)


@api_controller('/posts', auth=JWTAuth(), permissions=[IsAdminUser])
class PostController:

    @route.post('/create', response=PostSchema)
    def create_post(
        self,
        request,
        item: PostCreateSchema,
    ):
        payload = item.dict()
        post = Post.objects.create(
            title=payload['title'],
            text=payload['text'],
        )
        albums = []
        for index in range(len(payload['album_ids'])):
            album = get_object_or_404(Album, pk=payload['album_ids'][index])
            album.post = post
            album.index = index
            albums.append(album)
            album.save()
        if payload['is_published']:
            post.is_published = True
            for album in albums:
                album.pub_date = post.pub_date
                album.is_published = True
                album.save()
            post.telegram_content = compose_telegram(post)
            post.substack_content = compose_substack(post)
            post.save()
        return post

    @route.post('/send_to_telegram')
    def send_to_telegram(self, request, payload: TelegramText):
        bot = Bot(message=convert_to_markdown(payload.text))
        try:
            asyncio.run(bot.send_message())
            return JsonResponse({'status': 'success'}, status=200)
        except TelegramBadRequest as e:
            raise HttpError(400, e.message)

    @route.get('/', response=list[PostSchema])
    def get_posts(self, request):
        posts = Post.objects.all().prefetch_related(
            Prefetch(
                'albums',
                queryset=Album.objects.order_by('index')
            ),
            Prefetch('view_count')
        ).annotate(views=Sum('view_count__count')).order_by('id')

        # left for testing purposes
        # for post_post in posts:
        #     post_post.telegram_content = compose_telegram(post_post)
        #     post_post.substack_content = compose_substack(post_post)
        #     post_post.save()
        return posts

    @route.get('/{id}', response=PostSchema)
    def get_post(self, request, id: int):
        post = Post.objects.filter(pk=id).prefetch_related(
            Prefetch(
                'albums',
                queryset=Album.objects.order_by('index')
            ),
        ).get()
        return post

    @route.put('/{id}', response=PostSchema)
    def update_post(self, request, id: int, item: PostCreateSchema):
        payload = item.dict()
        post = get_object_or_404(
            Post.objects.prefetch_related('albums'),
            pk=id
        )
        post.title = payload['title']
        post.text = payload['text']
        post.pub_date = payload['pub_date']
        albums = []
        for index in range(len(payload['album_ids'])):
            album = get_object_or_404(Album, pk=payload['album_ids'][index])
            album.post = post
            album.index = index
            album.pub_date = post.pub_date
            albums.append(album)
            album.save()
        deleted_albums = post.albums.exclude(id__in=payload['album_ids'])
        deleted_albums.update(post=None, index=None, is_published=False)
        if payload['is_published']:
            post.is_published = True
            for album in albums:
                album.is_published = True
                album.save()
            post.telegram_content = compose_telegram(post)
            post.substack_content = compose_substack(post)
            post.save()
        post.is_published = payload['is_published']
        post.save()
        return post

    @route.delete('/{id}')
    def delete_post(self, request, id: int):
        post = get_object_or_404(Post, pk=id)
        post.delete()
        return

    @route.get('{id}/get_images')
    def get_images(self, request, id: int):
        post = get_object_or_404(Post, pk=id)
        image_paths = [
            os.path.join(settings.MEDIA_ROOT, f'output{album.id}.png')
            for album in post.albums.all()
        ]
        generate_images(post.albums.all())
        zip_file_path = os.path.join(
            settings.MEDIA_ROOT,
            'generated_images.zip'
        )
        with zipfile.ZipFile(zip_file_path, 'w') as zipf:
            for image_path in image_paths:
                zipf.write(image_path, os.path.basename(image_path))
        with open(zip_file_path, 'rb') as zip_file:
            response = HttpResponse(zip_file, content_type='application/zip')
            response['Content-Disposition'] = (
                'attachment; filename="generated_images.zip"'
            )
            return response
