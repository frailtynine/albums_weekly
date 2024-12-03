from django.test import TestCase
from django.contrib.auth import get_user_model


class BaseApiTestCase(TestCase):
    def setUp(self):
        User = get_user_model()
        self.superuser = User.objects.create_superuser(
            username='admin',
            password='admin',
            email='admin@admin.com'
        )
        token_response = self.client.post(
            '/api/token/pair',
            data={
                'password': 'admin',
                'username': 'admin',
            },
            content_type='application/json',
            HTTP_ACCEPT='application/json'
        )
        self.headers = {
            'HTTP_AUTHORIZATION': f'Bearer {token_response.json()['access']}',
        }

    def test_verify_auth(self):
        url = '/api/auth/verify'
        response = self.client.get(url, **self.headers)
        self.assertEqual(response.status_code, 200)
