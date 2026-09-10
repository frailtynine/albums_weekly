import { describe, expect, it } from 'vitest';
import { emptyAlbumDraft, emptyPostDraft, useCmsStore } from './cmsStore';

describe('cmsStore', () => {
  it('patches and resets drafts', () => {
    useCmsStore.getState().patchAlbumDraft({ band_name: 'Test band' });
    useCmsStore.getState().patchPostDraft({ title: 'Friday' });

    expect(useCmsStore.getState().albumDraft.band_name).toBe('Test band');
    expect(useCmsStore.getState().postDraft.title).toBe('Friday');

    useCmsStore.getState().resetDraft('albums');
    useCmsStore.getState().resetDraft('posts');

    expect(useCmsStore.getState().albumDraft).toEqual(emptyAlbumDraft);
    expect(useCmsStore.getState().postDraft).toEqual(emptyPostDraft);
  });
});
