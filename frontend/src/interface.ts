export interface AlbumCreateRequest {
  text: string;
  spotify_url: string;
  url: string;
  band_name: string;
  album_name: string;
  image_url: string;
  links: {
    [platform: string]: PlatformLinks;
  };
}

export interface AlbumResponse extends AlbumCreateRequest {
  id: number;
  is_published: boolean;
  pub_date: string;
  views: number;
}

export interface AlbumRequest extends AlbumCreateRequest {
  is_published: boolean;
  pub_date: string;
}


export interface LoginRequest {
  password: string;
  username: string;
}

export interface LoginResponse {
  username: string;
  refresh: string;
  access: string;
}

export interface TokenRequest {
  token: string;
}

export interface SonglinkData {
  url: string;
  links: {
    [platform: string]: PlatformLinks;
  };
  band_name: string;
  album_name: string;
  image_url: string;
}

export interface PlatformLinks {
  url: string;
  [key: string]: any;
}

export interface PostResponce {
  id: number;
  title: string;
  pub_date: string;
  albums: AlbumResponse[];
  is_published: boolean;
  telegram_content: string;
  substack_content: string;
  text: string;
  views: number;
}


export interface PostData {
  title: string;
  album_ids: number[];
  text: string;
  is_published: boolean;
}

export interface TelegramText {
  text: string
}

export interface AlertInterface {
  severity: 'error' | 'warning' | 'info' | 'success';
  message: string;
}

export interface TextRequest {
  title: string;
  content: string;
  is_published: boolean;
  pub_date: string;
}

export interface TextResponse extends TextRequest {
  id: number;
}

export interface PodcastRequest {
  yt_id: string;
  text: string;
  title: string;
  is_published: boolean;
  pub_date: string;
}

export interface PodcastResponse extends PodcastRequest {
  id: number;
}