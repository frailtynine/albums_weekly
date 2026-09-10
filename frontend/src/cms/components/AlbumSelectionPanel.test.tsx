import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AlbumSelectionPanel from './AlbumSelectionPanel';
import { AlbumResponse } from '../../interface';

const baseAlbum: AlbumResponse = {
  id: 1,
  band_name: 'Band',
  album_name: 'Album',
  text: '',
  spotify_url: '',
  url: '',
  image_url: '/cover.jpg',
  links: {},
  is_published: false,
  pub_date: '2026-09-04T10:00:00.000Z',
  views: 0,
  index: 0,
  telegram: '',
};

describe('AlbumSelectionPanel', () => {
  it('adds and removes albums', async () => {
    const user = userEvent.setup();
    const onAddAlbum = vi.fn();
    const onRemoveAlbum = vi.fn();

    render(
      <AlbumSelectionPanel
        availableAlbums={[baseAlbum]}
        selectedAlbums={[{ ...baseAlbum, id: 2, band_name: 'Selected' }]}
        onAddAlbum={onAddAlbum}
        onRemoveAlbum={onRemoveAlbum}
        onReorder={vi.fn()}
      />
    );

    await user.click(screen.getByText('Band - Album'));
    await user.click(screen.getByRole('button', { name: 'Remove Selected' }));

    expect(onAddAlbum).toHaveBeenCalledWith(1);
    expect(onRemoveAlbum).toHaveBeenCalledWith(2);
  });
});
