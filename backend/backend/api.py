from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController

from api.controllers.albums import AlbumController
from api.controllers.auth import AuthController
from api.controllers.posts import PostController
from api.controllers.texts import TextController
from api.controllers.podcasts import PodcastController


api = NinjaExtraAPI()

api.register_controllers(
    NinjaJWTDefaultController,
    AlbumController,
    AuthController,
    PostController,
    TextController,
    PodcastController
)
