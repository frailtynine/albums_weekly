import axios from 'axios';
import getYouTubeID from 'get-youtube-id';
import {
  AlbumCreateRequest,
  AlbumRequest,
  AlbumResponse,
  LoginRequest,
  LoginResponse,
  PodcastRequest,
  PodcastResponse,
  PostData,
  PostResponce,
  SonglinkData,
  TelegramText,
  TextRequest,
  TextResponse,
} from '../../interface';
import apiClient from './client';
import { BASE_URL } from './constants';

export type EntityType = 'posts' | 'albums' | 'texts' | 'podcasts';

export interface DashboardData {
  posts: PostResponce[];
  albums: AlbumResponse[];
  texts: TextResponse[];
  podcasts: PodcastResponse[];
}

export async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/token/pair', loginRequest);
  return response.data;
}

export async function verifyAuth(): Promise<number> {
  const response = await apiClient.get('/auth/verify');
  return response.status;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [posts, albums, texts, podcasts] = await Promise.all([
    apiClient.get<PostResponce[]>('/posts/'),
    apiClient.get<AlbumResponse[]>('/albums'),
    apiClient.get<TextResponse[]>('/texts'),
    apiClient.get<PodcastResponse[]>('/podcasts'),
  ]);

  return {
    posts: posts.data,
    albums: albums.data,
    texts: texts.data,
    podcasts: podcasts.data,
  };
}

export async function fetchAlbums(): Promise<AlbumResponse[]> {
  const response = await apiClient.get<AlbumResponse[]>('/albums');
  return response.data;
}

export async function fetchAlbum(id: number): Promise<AlbumResponse> {
  const response = await apiClient.get<AlbumResponse>(`/albums/${id}`);
  return response.data;
}

export async function createAlbum(payload: AlbumRequest): Promise<AlbumResponse> {
  const response = await apiClient.post<AlbumResponse>('/albums/create', payload);
  return response.data;
}

export async function updateAlbumById(id: number, payload: AlbumCreateRequest): Promise<AlbumResponse> {
  const response = await apiClient.put<AlbumResponse>(`/albums/${id}`, payload);
  return response.data;
}

export async function fetchPost(id: number): Promise<PostResponce> {
  const response = await apiClient.get<PostResponce>(`/posts/${id}`);
  return response.data;
}

export async function createPost(payload: PostData) {
  return apiClient.post('/posts/create', payload);
}

export async function updatePost(id: number, payload: PostData) {
  return apiClient.put(`/posts/${id}`, payload);
}

export async function fetchText(id: number): Promise<TextResponse> {
  const response = await apiClient.get<TextResponse>(`/texts/${id}`);
  return response.data;
}

export async function createText(payload: TextRequest) {
  return apiClient.post('/texts/create', payload);
}

export async function updateText(id: number, payload: TextRequest) {
  return apiClient.put(`/texts/${id}`, payload);
}

export async function fetchPodcast(id: number): Promise<PodcastResponse> {
  const response = await apiClient.get<PodcastResponse>(`/podcasts/${id}`);
  return response.data;
}

export async function createPodcast(payload: PodcastRequest) {
  return apiClient.post('/podcasts/create', payload);
}

export async function updatePodcast(id: number, payload: PodcastRequest) {
  return apiClient.put(`/podcasts/${id}`, payload);
}

export async function fetchSonglink(url: string): Promise<SonglinkData> {
  const response = await apiClient.post<SonglinkData>(`/albums/songlink?url=${url}`);
  return response.data;
}

export async function deleteEntity(type: EntityType, id: number) {
  return apiClient.delete(`/${type}/${id}`);
}

export async function postToTelegram(payload: TelegramText) {
  return apiClient.post('/posts/send_to_telegram', payload);
}

export async function fetchYouTubeDetails(url: string): Promise<Pick<PodcastRequest, 'yt_id' | 'title' | 'text'>> {
  const ytId = getYouTubeID(url);
  const apiKey = import.meta.env.VITE_YT_API;

  if (!ytId) {
    throw new Error('Invalid YouTube URL');
  }

  const response = await axios.get<any>(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ytId}&key=${apiKey}`
  );

  const snippet = response.data.items?.[0]?.snippet;

  if (!snippet) {
    throw new Error('Video metadata is unavailable');
  }

  return {
    yt_id: ytId,
    title: snippet.title || '',
    text: snippet.description?.replace(/\n/g, '<br>') || '',
  };
}

export function resolveImageUrl(imageUrl: string) {
  if (!imageUrl) {
    return '';
  }

  return /^(https?:\/\/|data:)/.test(imageUrl) ? imageUrl : `${BASE_URL}${imageUrl}`;
}
