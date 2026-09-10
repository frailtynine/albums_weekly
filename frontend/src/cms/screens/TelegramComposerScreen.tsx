import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAlbum, fetchPodcast, fetchPost, postToTelegram } from '../api/cmsApi';
import EntityFormScaffold from '../components/EntityFormScaffold';
import RichTextEditor from '../components/RichTextEditor';

export default function TelegramComposerScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const [telegramText, setTelegramText] = useState('');
  const type = params.type;
  const elementId = params.id ? Number(params.id) : null;

  const postQuery = useQuery({
    queryKey: ['telegram-post', elementId],
    queryFn: () => fetchPost(elementId as number),
    enabled: type === 'posts' && Boolean(elementId),
  });
  const albumQuery = useQuery({
    queryKey: ['telegram-album', elementId],
    queryFn: () => fetchAlbum(elementId as number),
    enabled: type === 'albums' && Boolean(elementId),
  });
  const podcastQuery = useQuery({
    queryKey: ['telegram-podcast', elementId],
    queryFn: () => fetchPodcast(elementId as number),
    enabled: type === 'podcasts' && Boolean(elementId),
  });

  useEffect(() => {
    if (postQuery.data) {
      setTelegramText(postQuery.data.telegram_content || '');
    } else if (albumQuery.data) {
      setTelegramText(albumQuery.data.telegram || '');
    } else if (podcastQuery.data) {
      setTelegramText(podcastQuery.data.text || '');
    }
  }, [albumQuery.data, podcastQuery.data, postQuery.data]);

  const mutation = useMutation({
    mutationFn: () => postToTelegram({ text: telegramText }),
    onSuccess: () => navigate('/cms'),
  });

  const heading = useMemo(() => {
    if (postQuery.data) return postQuery.data.title;
    if (albumQuery.data) return `${albumQuery.data.band_name} - ${albumQuery.data.album_name}`;
    if (podcastQuery.data) return podcastQuery.data.title;
    return 'Telegram composer';
  }, [albumQuery.data, podcastQuery.data, postQuery.data]);

  if (postQuery.isError || albumQuery.isError || podcastQuery.isError) {
    return <Alert severity="error">Failed to load Telegram content.</Alert>;
  }

  return (
    <EntityFormScaffold
      title="Telegram composer"
      subtitle="Review the generated copy before sending it to the channel."
      showMeta={false}
      pubDate=""
      isPublished={false}
      onPubDateChange={() => undefined}
      onPublishedChange={() => undefined}
      onCancel={() => navigate('/cms')}
      onSubmit={() => mutation.mutate()}
      submitLabel={mutation.isPending ? 'Posting...' : 'Post to Telegram'}
    >
      <Stack spacing={2}>
        <Typography variant="h6">{heading}</Typography>
        {mutation.isError && <Alert severity="error">Failed to send Telegram message.</Alert>}
        <RichTextEditor value={telegramText} onChange={setTelegramText} charLimit={4000} minHeight={360} />
      </Stack>
    </EntityFormScaffold>
  );
}
