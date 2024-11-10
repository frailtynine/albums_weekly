from ninja_extra import api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja_extra.permissions import IsAdminUser


@api_controller('/auth', auth=JWTAuth(), permissions=[IsAdminUser])
class AuthController:

    @route.get('verify', response={200: str})
    def verify(self, request):
        """Simple endpoint to prove authentification."""
        return 200, 'Auth success'
