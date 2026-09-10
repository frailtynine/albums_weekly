import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAlbum, fetchAlbum, fetchSonglink, resolveImageUrl, updateAlbumById } from '../api/cmsApi';
import EntityFormScaffold from '../components/EntityFormScaffold';
import RichTextEditor from '../components/RichTextEditor';
import { AlbumRequest } from '../../interface';
import { emptyAlbumDraft, useCmsStore } from '../state/cmsStore';

const musicPlatformFields = [
  { key: 'spotify', label: 'Spotify URL' },
  { key: 'tidal', label: 'Tidal URL' },
  { key: 'appleMusic', label: 'Apple Music URL' },
  { key: 'deezer', label: 'Deezer URL' },
] as const;

type MusicPlatformKey = (typeof musicPlatformFields)[number]['key'];

export default function AlbumEditorScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const elementId = params.id ? Number(params.id) : null;
  const isEditing = Boolean(elementId);
  const albumDraft = useCmsStore((state) => state.albumDraft);
  const replaceAlbumDraft = useCmsStore((state) => state.replaceAlbumDraft);
  const patchAlbumDraft = useCmsStore((state) => state.patchAlbumDraft);
  const resetDraft = useCmsStore((state) => state.resetDraft);
  const initializedRef = useRef(false);
  const [autofillUrl, setAutofillUrl] = useState('');
  const [songlinkError, setSonglinkError] = useState('');
  const wasPublishedRef = useRef(false);

  const albumQuery = useQuery({
    queryKey: ['album', elementId],
    queryFn: () => fetchAlbum(elementId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!isEditing && !initializedRef.current) {
      replaceAlbumDraft(emptyAlbumDraft);
      initializedRef.current = true;
    }
  }, [isEditing, replaceAlbumDraft]);

  useEffect(() => {
    if (albumQuery.data && !initializedRef.current) {
      wasPublishedRef.current = albumQuery.data.is_published;
      const draft: AlbumRequest = {
        ...albumQuery.data,
        spotify_url: albumQuery.data.spotify_url || albumQuery.data.links?.spotify?.url || '',
      };
      replaceAlbumDraft(draft);
      setAutofillUrl(albumQuery.data.spotify_url || albumQuery.data.url || '');
      initializedRef.current = true;
    }
  }, [albumQuery.data, replaceAlbumDraft]);

  const mutation = useMutation({
    mutationFn: async (payload: AlbumRequest) => {
      if (isEditing && elementId) {
        return updateAlbumById(elementId, payload);
      }
      return createAlbum(payload);
    },
    onSuccess: async () => {
      resetDraft('albums');
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/cms');
    },
  });

  const resolvedImageUrl = useMemo(() => resolveImageUrl(albumDraft.image_url), [albumDraft.image_url]);

  const handleSonglinkData = async () => {
    if (!autofillUrl.trim()) {
      setSonglinkError('Enter a link to auto-fill album data.');
      return;
    }

    try {
      setSonglinkError('');
      const response = await fetchSonglink(autofillUrl.trim());
      replaceAlbumDraft({
        ...albumDraft,
        ...response,
        spotify_url: response.links?.spotify?.url || albumDraft.spotify_url || autofillUrl.trim(),
      });
    } catch {
      setSonglinkError('Autofill failed. Please try again.');
    }
  };

  const handleMusicLinkChange = (platform: MusicPlatformKey, value: string) => {
    const nextLinks = { ...albumDraft.links };

    if (value.trim()) {
      nextLinks[platform] = {
        ...(nextLinks[platform] || {}),
        url: value,
      };
    } else {
      delete nextLinks[platform];
    }

    patchAlbumDraft({
      links: nextLinks,
      ...(platform === 'spotify' ? { spotify_url: value } : {}),
    });
  };

  const getMusicLinkValue = (platform: MusicPlatformKey) => {
    if (platform === 'spotify') {
      return albumDraft.spotify_url || albumDraft.links?.spotify?.url || '';
    }

    return albumDraft.links?.[platform]?.url || '';
  };

  const handleSubmit = () => {
    const payload: AlbumRequest = {
      ...albumDraft,
      pub_date:
        isEditing && !wasPublishedRef.current && albumDraft.is_published
          ? new Date().toISOString()
          : albumDraft.pub_date || new Date().toISOString(),
    };
    mutation.mutate(payload);
  };

  if (albumQuery.isError) {
    return <Alert severity="error">Failed to load album data.</Alert>;
  }

  return (
    <EntityFormScaffold
      title={isEditing ? 'Edit album' : 'Create album'}
      subtitle="Rebuilt album workflow with persisted draft state and a cleaner publishing surface."
      pubDate={albumDraft.pub_date}
      isPublished={albumDraft.is_published}
      onPubDateChange={(value) => patchAlbumDraft({ pub_date: value })}
      onPublishedChange={(value) => patchAlbumDraft({ is_published: value })}
      onCancel={() => navigate('/cms')}
      onSubmit={handleSubmit}
      submitLabel={mutation.isPending ? 'Saving...' : 'Save album'}
    >
      <Stack spacing={2}>
        {songlinkError && <Alert severity="error">{songlinkError}</Alert>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Band name"
            value={albumDraft.band_name}
            onChange={(event) => patchAlbumDraft({ band_name: event.target.value })}
            fullWidth
          />
          <TextField
            label="Album name"
            value={albumDraft.album_name}
            onChange={(event) => patchAlbumDraft({ album_name: event.target.value })}
            fullWidth
          />
        </Stack>
        <RichTextEditor value={albumDraft.text} onChange={(text) => patchAlbumDraft({ text })} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="Autofill URL"
            value={autofillUrl}
            onChange={(event) => setAutofillUrl(event.target.value)}
            onPaste={(event) => {
              const pastedText = event.clipboardData.getData('text');
              setAutofillUrl(pastedText);
            }}
            helperText="Paste or enter a link here to auto-fill album data."
            fullWidth
          />
          <Button variant="outlined" onClick={() => void handleSonglinkData()} disabled={!autofillUrl.trim()}>
            Autofill
          </Button>
        </Stack>
        <Stack spacing={1.5}>
          <Typography variant="h6">Streaming links</Typography>
          {musicPlatformFields.map(({ key, label }) => (
            <Stack key={key} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label={label}
                value={getMusicLinkValue(key)}
                onChange={(event) => handleMusicLinkChange(key, event.target.value)}
                fullWidth
              />
              <Button variant="text" color="inherit" onClick={() => handleMusicLinkChange(key, '')}>
                Remove
              </Button>
            </Stack>
          ))}
        </Stack>
        <Stack spacing={1.5}>
          <Typography variant="h6">Cover image</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Image URL"
              value={albumDraft.image_url}
              onChange={(event) => patchAlbumDraft({ image_url: event.target.value })}
              fullWidth
            />
            <Button variant="text" color="inherit" onClick={() => patchAlbumDraft({ image_url: '' })}>
              Remove
            </Button>
          </Stack>
          {resolvedImageUrl && (
            <Box
              component="img"
              src={resolvedImageUrl}
              alt="Album cover preview"
              sx={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}
            />
          )}
        </Stack>
      </Stack>
    </EntityFormScaffold>
  );
}
