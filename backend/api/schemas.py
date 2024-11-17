from datetime import datetime
from typing import Dict, Optional

from ninja import Schema
from pydantic import field_validator


class ViewCount(Schema):
    count: int


class AlbumSchema(Schema):
    id: int
    text: str
    spotify_url: str
    url: str
    band_name: str
    album_name: str
    image_url: str
    links: Dict[str, Dict[str, str]]
    is_published: bool
    pub_date: datetime
    views: Optional[int] = 0


class AlbumCreateSchema(Schema):
    text: str
    spotify_url: str
    url: str
    band_name: str
    album_name: str
    image_url: str
    links: Dict[str, Dict[str, str]]

    @field_validator('text', 'band_name')
    def must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('must not be empty')
        return v


class PostSchema(Schema):
    id: int
    title: str
    pub_date: datetime
    albums: list[AlbumSchema]
    is_published: bool
    telegram_content: Optional[str] = None
    substack_content: Optional[str] = None
    text: Optional[str] = None
    views: Optional[int] = 0


class PostCreateSchema(Schema):
    title: str
    album_ids: list[int]
    text: str
    is_published: bool


class PostByDateSchema(Schema):
    posts: Dict[int, Dict[int, list[PostSchema]]]


class SonglinkResponse(Schema):
    url: str
    links: Dict[str, Dict[str, str]]
    band_name: str
    album_name: str
    image_url: str


class TelegramText(Schema):
    text: str


class TextCreateSchema(Schema):
    title: str
    content: str
    is_published: bool


class TextSchema(TextCreateSchema):
    id: int
    pub_date: datetime


class PodcastCreateSchema(Schema):
    yt_id: str
    title: str
    text: str
    is_published: bool


class PodcastSchema(PodcastCreateSchema):
    id: int
    pub_date: datetime
