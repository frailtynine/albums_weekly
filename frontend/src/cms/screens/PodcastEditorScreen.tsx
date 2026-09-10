import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPodcast, fetchPodcast, fetchYouTubeDetails, updatePodcast } from '../api/cmsApi';
import EntityFormScaffold from '../components/EntityFormScaffold';
import RichTextEditor from '../components/RichTextEditor';
import { emptyPodcastDraft, useCmsStore } from '../state/cmsStore';

export default function PodcastEditorScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const elementId = params.id ? Number(params.id) : null;
  const isEditing = Boolean(elementId);
  const podcastDraft = useCmsStore((state) => state.podcastDraft);
  const replacePodcastDraft = useCmsStore((state) => state.replacePodcastDraft);
  const patchPodcastDraft = useCmsStore((state) => state.patchPodcastDraft);
  const resetDraft = useCmsStore((state) => state.resetDraft);
  const initializedRef = useRef(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');

  const podcastQuery = useQuery({
    queryKey: ['podcast', elementId],
    queryFn: () => fetchPodcast(elementId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!isEditing && !initializedRef.current) {
      replacePodcastDraft(emptyPodcastDraft);
      initializedRef.current = true;
    }
  }, [isEditing, replacePodcastDraft]);

  useEffect(() => {
    if (podcastQuery.data && !initializedRef.current) {
      replacePodcastDraft(podcastQuery.data);
      setYoutubeUrl(`https://www.youtube.com/watch?v=${podcastQuery.data.yt_id}`);
      initializedRef.current = true;
    }
  }, [podcastQuery.data, replacePodcastDraft]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...podcastDraft,
        pub_date: podcastDraft.pub_date || new Date().toISOString(),
      };

      if (isEditing && elementId) {
        return updatePodcast(elementId, payload);
      }

      return createPodcast(payload);
    },
    onSuccess: async () => {
      resetDraft('podcasts');
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/cms');
    },
  });

  const hydrateFromYoutube = async () => {
    try {
      setYoutubeError('');
      const payload = await fetchYouTubeDetails(youtubeUrl);
      replacePodcastDraft({
        ...podcastDraft,
        ...payload,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid YouTube URL';
      setYoutubeError(message);
    }
  };

  if (podcastQuery.isError) {
    return <Alert severity="error">Failed to load podcast data.</Alert>;
  }

  return (
    <EntityFormScaffold
      title={isEditing ? 'Edit podcast' : 'Create podcast'}
      subtitle="Paste a YouTube link, hydrate metadata, and edit the final podcast body before publishing."
      pubDate={podcastDraft.pub_date}
      isPublished={podcastDraft.is_published}
      onPubDateChange={(value) => patchPodcastDraft({ pub_date: value })}
      onPublishedChange={(value) => patchPodcastDraft({ is_published: value })}
      onCancel={() => navigate('/cms')}
      onSubmit={() => mutation.mutate()}
      submitLabel={mutation.isPending ? 'Saving...' : 'Save podcast'}
    >
      <Stack spacing={2}>
        {youtubeError && <Alert severity="error">{youtubeError}</Alert>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <TextField
            label="YouTube URL"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            fullWidth
          />
          <Button variant="outlined" onClick={() => void hydrateFromYoutube()} disabled={!youtubeUrl.trim()}>
            Fetch metadata
          </Button>
        </Stack>
        <TextField
          label="Title"
          value={podcastDraft.title}
          onChange={(event) => patchPodcastDraft({ title: event.target.value })}
          fullWidth
        />
        <RichTextEditor value={podcastDraft.text} onChange={(text) => patchPodcastDraft({ text })} charLimit={4000} />
      </Stack>
    </EntityFormScaffold>
  );
}
