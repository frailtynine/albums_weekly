import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEntity, EntityType, fetchDashboardData } from '../api/cmsApi';
import { useCmsStore } from '../state/cmsStore';
import DashboardItemCard, { DashboardCardItem } from '../components/DashboardItemCard';
import { copyToClipboard, openSubstack } from '../utils/substack';

type DeleteTarget = { id: number; type: EntityType; title: string } | null;

export default function DashboardScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dashboardFilter = useCmsStore((state) => state.dashboardFilter);
  const setDashboardFilter = useCmsStore((state) => state.setDashboardFilter);
  const searchTerm = useCmsStore((state) => state.searchTerm);
  const setSearchTerm = useCmsStore((state) => state.setSearchTerm);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [clipboardError, setClipboardError] = useState('');

  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: EntityType; id: number }) => deleteEntity(type, id),
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const items = useMemo<DashboardCardItem[]>(() => {
    if (!dashboardQuery.data) {
      return [];
    }

    const { posts, albums, texts, podcasts } = dashboardQuery.data;

    return [
      ...posts.map((post) => ({
        id: post.id,
        type: 'posts' as const,
        title: post.title,
        date: post.pub_date,
        isPublished: post.is_published,
        views: post.views,
        substackContent: post.substack_content,
      })),
      ...albums.map((album) => ({
        id: album.id,
        type: 'albums' as const,
        title: `${album.band_name} - ${album.album_name}`,
        date: album.pub_date,
        isPublished: album.is_published,
        views: album.views,
      })),
      ...texts.map((text) => ({
        id: text.id,
        type: 'texts' as const,
        title: text.title,
        date: text.pub_date,
        isPublished: text.is_published,
        substackContent: text.content,
      })),
      ...podcasts.map((podcast) => ({
        id: podcast.id,
        type: 'podcasts' as const,
        title: podcast.title,
        date: podcast.pub_date,
        isPublished: podcast.is_published,
        substackContent: `${podcast.title}  \n ${podcast.text} \n https://www.youtube.com/watch?v=${podcast.yt_id}`,
      })),
    ]
      .filter((item) => dashboardFilter === 'all' || item.type === dashboardFilter)
      .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((left, right) => +new Date(right.date) - +new Date(left.date));
  }, [dashboardFilter, dashboardQuery.data, searchTerm]);

  const handleSubstack = async (item: DashboardCardItem) => {
    if (!item.substackContent) {
      return;
    }

    try {
      setClipboardError('');
      await copyToClipboard(item.substackContent);
      if (item.type === 'posts' || item.type === 'podcasts') {
        openSubstack(item.type);
      }
    } catch {
      setClipboardError('Failed to copy data for Substack.');
    }
  };

  if (dashboardQuery.isPending) {
    return <Typography>Loading dashboard...</Typography>;
  }

  if (dashboardQuery.isError) {
    return <Alert severity="error">Failed to load dashboard data.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2} justifyContent="space-between">
        <Typography variant="h4">Dashboard</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="outlined" startIcon={<TelegramIcon />} onClick={() => navigate('/cms/telegram')}>
            Telegram composer
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/cms/albums/new')}>
            New album
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between">
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {(['all', 'posts', 'albums', 'texts', 'podcasts'] as const).map((filter) => (
              <Button
                key={filter}
                variant={dashboardFilter === filter ? 'contained' : 'outlined'}
                onClick={() => setDashboardFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </Stack>
          <TextField
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{ minWidth: { lg: 260 } }}
          />
        </Stack>
      </Card>

      {clipboardError && <Alert severity="error">{clipboardError}</Alert>}

      <Stack spacing={1.25}>
        {items.map((item) => (
          <DashboardItemCard
            key={`${item.type}-${item.id}`}
            item={item}
            onEdit={() => navigate(`/cms/${item.type}/${item.id}`)}
            onDelete={() => setDeleteTarget({ id: item.id, type: item.type, title: item.title })}
            onTelegram={item.type === 'texts' ? undefined : () => navigate(`/cms/telegram/${item.type}/${item.id}`)}
            onShareImages={item.type === 'posts' ? () => navigate(`/cms/posts/${item.id}/share-images`) : undefined}
            onSubstack={item.type === 'albums' ? undefined : () => void handleSubstack(item)}
          />
        ))}
      </Stack>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete item</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => deleteTarget && deleteMutation.mutate({ type: deleteTarget.type, id: deleteTarget.id })}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
