from django.test import TestCase, RequestFactory
from django.utils import timezone
from django.urls import reverse
from api.models import Post, Album, Podcast, Text


class BaseTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.url = reverse('index')

        self.post = Post.objects.create(
            title="Test Post",
            is_published=True,
            pub_date=timezone.now(),
            text="Test content"
        )
        self.album = Album.objects.create(
            post=self.post,
            band_name="Band",
            album_name="Album",
            url="https://example.com",
            image_url="/image.jpg",
            links={"spotify": "https://example.com"},
            index=1,
            is_published=True,
            pub_date=timezone.now()
        )
        self.podcast = Podcast.objects.create(
            title="Test Podcast",
            text="Test content",
            is_published=True,
            pub_date=timezone.now()
        )
        self.text = Text.objects.create(
            title="Test Text",
            is_published=True,
            content="Test content",
            pub_date=timezone.now()
        )


class IndexViewTest(BaseTestCase):
    def test_index_view(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pages/index.html')

        context_data = response.context_data['object_list']
        self.assertIn(self.post, context_data)
        self.assertIn(self.podcast, context_data)
        self.assertIn(self.text, context_data)

        combined_list = sorted(
            [self.post, self.podcast, self.text],
            key=lambda instance: instance.pub_date,
            reverse=True
        )
        self.assertEqual(list(context_data), combined_list)


class PodcastDetailViewTest(BaseTestCase):
    def test_podcast_detail_view(self):
        url = reverse('podcast_detail', kwargs={'pk': self.podcast.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pages/podcast_detail.html')

        context_data = response.context_data['object']
        self.assertEqual(context_data, self.podcast)


class TextDetailViewTest(BaseTestCase):
    def test_text_detail_view(self):
        url = reverse('text_detail', kwargs={'pk': self.text.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pages/text_detail.html')

        context_data = response.context_data['object']
        self.assertEqual(context_data, self.text)


class AlbumDetailViewTest(BaseTestCase):
    def test_album_detail_view(self):
        url = reverse('album_detail', kwargs={'pk': self.album.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pages/album_detail.html')

        context_data = response.context_data['object']
        self.assertEqual(context_data, self.album)
