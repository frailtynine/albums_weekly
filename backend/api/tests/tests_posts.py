from django.utils import timezone

from api.models import Album, Post
from api.tests.base import BaseApiTestCase
from api.utils import compose_substack


class PostApiTestCase(BaseApiTestCase):
    def test_compose_substack_orders_albums_by_index(self):
        """Test that compose_substack orders albums by their index field."""
        # Create a post
        post = Post.objects.create(
            title='Test Post',
            pub_date=timezone.now(),
            is_published=False,
            text='Test post content'
        )
        
        # Create albums with specific order (intentionally reverse order)
        album1 = Album.objects.create(
            text="First album text",
            spotify_url="https://open.spotify.com/album/1",
            url="https://album.link/1",
            image_url="/media/album_covers/album1.jpeg",
            band_name="Band A",
            album_name="Album A",
            is_published=False,
            pub_date=timezone.now(),
            links={},
            post=post,
            index=0  # First position
        )
        
        album2 = Album.objects.create(
            text="Second album text",
            spotify_url="https://open.spotify.com/album/2",
            url="https://album.link/2",
            image_url="/media/album_covers/album2.jpeg",
            band_name="Band B",
            album_name="Album B",
            is_published=False,
            pub_date=timezone.now(),
            links={},
            post=post,
            index=1  # Second position
        )
        
        album3 = Album.objects.create(
            text="Third album text",
            spotify_url="https://open.spotify.com/album/3",
            url="https://album.link/3",
            image_url="/media/album_covers/album3.jpeg",
            band_name="Band C",
            album_name="Album C",
            is_published=False,
            pub_date=timezone.now(),
            links={},
            post=post,
            index=2  # Third position
        )
        
        # Get the substack content
        result = compose_substack(post)
        
        # Verify the order in the result matches the index order
        # Band A should appear before Band B, which should appear before Band C
        pos_a = result.find('Band A')
        pos_b = result.find('Band B')
        pos_c = result.find('Band C')
        
        self.assertLess(pos_a, pos_b, "Band A should appear before Band B")
        self.assertLess(pos_b, pos_c, "Band B should appear before Band C")
        
        # Clean up
        album1.delete()
        album2.delete()
        album3.delete()
        post.delete()
