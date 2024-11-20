import axios from "axios";
import { AlbumResponse, LoginRequest, LoginResponse, SonglinkData, AlbumCreateRequest, TelegramText } from "./interface";


export const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
    baseURL: `${BASE_URL}/api`
  }
)

// access token mechanics
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

// refresh token mechanics 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE_URL}/api/token/refresh`, { refresh: refreshToken });
        const { access: token } = response.data;

        localStorage.setItem('token', token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
)

export async function fetchModels(endpoint: string): Promise<any> {
    const response = await api.get<any>(`/${endpoint}`);
    return response.data;
}

export async function fetchModel(endpoint: string, id: number): Promise<any> {
  const response = await api.get<any>(`/${endpoint}/${id}`);
  return response.data;
}

export async function fetchLogin(loginRequest: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(`/token/pair`, loginRequest)
  return response.data
}

// call to empty endpoint to check if token is accepted.
export async function verifyToken(): Promise<any> {
  const response = await api.get<any>('/auth/verify');
  return response.status
}

export async function fetchSonglinkData(url: string): Promise<SonglinkData> {
  const response = await api.post<SonglinkData>(`/albums/songlink?url=${url}`);
  return response.data
}

export async function postAlbum(albumData: AlbumCreateRequest): Promise<AlbumResponse> {
  const response = await api.post<any>('/albums/create', albumData);
  return response.data
}

export async function updateAlbum(albumId: number, albumData: AlbumCreateRequest): Promise<AlbumResponse> {
  const response = await api.put<any>(`/albums/${albumId}`, albumData);
  return response.data
}

export async function updateModel(endpoint: string, id: number, payload: any): Promise<any> {
  const response = await api.put<any>(`/${endpoint}/${id}`, payload);
  return response.data
}


export async function postModel(url: string, payload: any): Promise<any> {
  const response = await api.post<any>(url, payload);
  return response
}

export async function deleteModel(endpoint: string ,id: number) {
  const response = await api.delete<any>(`/${endpoint}/${id}`);
  return response;
}



export async function getImages(id: number): Promise<any> {
  try {
    const response = await api.get<any>(`/posts/${id}/get_images`, {responseType: 'blob'});
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  }
  catch (error) { 
    console.error('Error downloading images:', error)
  }
}

export function revokeBlobUrl(url: string) {
  window.URL.revokeObjectURL(url);
}


export async function getFile(id: number): Promise<any> {
  const response = await api.get<any>(`/posts/${id}/get_images`);
  console.log(response.data);
  return response.data;
}

export async function postToTelegram(text: TelegramText): Promise<any> {
  const response = await api.post<any>(`/posts/send_to_telegram`, text);
  return response;
}