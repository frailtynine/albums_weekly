import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';
import { AlbumRequest, PodcastRequest, PostData, TextRequest } from '../../interface';
import { EntityType } from '../api/cmsApi';

export const emptyAlbumDraft: AlbumRequest = {
  album_name: '',
  text: '',
  band_name: '',
  spotify_url: '',
  url: '',
  image_url: '',
  links: {},
  is_published: false,
  pub_date: '',
};

export const emptyPostDraft: PostData = {
  title: '',
  album_ids: [],
  text: '',
  is_published: false,
  pub_date: '',
};

export const emptyTextDraft: TextRequest = {
  title: '',
  content: '',
  is_published: false,
  pub_date: '',
};

export const emptyPodcastDraft: PodcastRequest = {
  yt_id: '',
  title: '',
  text: '',
  is_published: false,
  pub_date: '',
};

interface CmsStoreState {
  dashboardFilter: 'all' | EntityType;
  searchTerm: string;
  albumDraft: AlbumRequest;
  postDraft: PostData;
  textDraft: TextRequest;
  podcastDraft: PodcastRequest;
  setDashboardFilter: (filter: 'all' | EntityType) => void;
  setSearchTerm: (term: string) => void;
  replaceAlbumDraft: (draft: AlbumRequest) => void;
  patchAlbumDraft: (patch: Partial<AlbumRequest>) => void;
  replacePostDraft: (draft: PostData) => void;
  patchPostDraft: (patch: Partial<PostData>) => void;
  replaceTextDraft: (draft: TextRequest) => void;
  patchTextDraft: (patch: Partial<TextRequest>) => void;
  replacePodcastDraft: (draft: PodcastRequest) => void;
  patchPodcastDraft: (patch: Partial<PodcastRequest>) => void;
  resetDraft: (type: EntityType) => void;
}

type CmsStorePersistedState = Pick<
  CmsStoreState,
  'dashboardFilter' | 'searchTerm' | 'albumDraft' | 'postDraft' | 'textDraft' | 'podcastDraft'
>;

const cmsStoreStorage: PersistStorage<CmsStorePersistedState> = {
  getItem: (name) => {
    const value = globalThis.localStorage?.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name, value) => {
    globalThis.localStorage?.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    globalThis.localStorage?.removeItem(name);
  },
};

export const useCmsStore = create<CmsStoreState>()(
  persist(
    (set) => ({
      dashboardFilter: 'all',
      searchTerm: '',
      albumDraft: emptyAlbumDraft,
      postDraft: emptyPostDraft,
      textDraft: emptyTextDraft,
      podcastDraft: emptyPodcastDraft,
      setDashboardFilter: (dashboardFilter) => set({ dashboardFilter }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      replaceAlbumDraft: (albumDraft) => set({ albumDraft }),
      patchAlbumDraft: (patch) => set((state) => ({ albumDraft: { ...state.albumDraft, ...patch } })),
      replacePostDraft: (postDraft) => set({ postDraft }),
      patchPostDraft: (patch) => set((state) => ({ postDraft: { ...state.postDraft, ...patch } })),
      replaceTextDraft: (textDraft) => set({ textDraft }),
      patchTextDraft: (patch) => set((state) => ({ textDraft: { ...state.textDraft, ...patch } })),
      replacePodcastDraft: (podcastDraft) => set({ podcastDraft }),
      patchPodcastDraft: (patch) => set((state) => ({ podcastDraft: { ...state.podcastDraft, ...patch } })),
      resetDraft: (type) =>
        set(() => {
          if (type === 'albums') {
            return { albumDraft: emptyAlbumDraft };
          }
          if (type === 'posts') {
            return { postDraft: emptyPostDraft };
          }
          if (type === 'texts') {
            return { textDraft: emptyTextDraft };
          }
          return { podcastDraft: emptyPodcastDraft };
        }),
    }),
    {
      name: 'cms-store',
      storage: cmsStoreStorage,
      partialize: (state) => ({
        dashboardFilter: state.dashboardFilter,
        searchTerm: state.searchTerm,
        albumDraft: state.albumDraft,
        postDraft: state.postDraft,
        textDraft: state.textDraft,
        podcastDraft: state.podcastDraft,
      }),
    }
  )
);
