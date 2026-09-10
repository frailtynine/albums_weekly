import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, fetchAlbums, fetchPost, updatePost } from '../api/cmsApi';
import EntityFormScaffold from '../components/EntityFormScaffold';
import RichTextEditor from '../components/RichTextEditor';
import AlbumSelectionPanel from '../components/AlbumSelectionPanel';
import { emptyPostDraft, useCmsStore } from '../state/cmsStore';

export default function PostEditorScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const elementId = params.id ? Number(params.id) : null;
  const isEditing = Boolean(elementId);
  const postDraft = useCmsStore((state) => state.postDraft);
  const replacePostDraft = useCmsStore((state) => state.replacePostDraft);
  const patchPostDraft = useCmsStore((state) => state.patchPostDraft);
  const resetDraft = useCmsStore((state) => state.resetDraft);
  const initializedRef = useRef(false);

  const postQuery = useQuery({
    queryKey: ['post', elementId],
    queryFn: () => fetchPost(elementId as number),
    enabled: isEditing,
  });

  const albumsQuery = useQuery({
    queryKey: ['albums'],
    queryFn: fetchAlbums,
  });

  useEffect(() => {
    if (!isEditing && !initializedRef.current) {
      replacePostDraft(emptyPostDraft);
      initializedRef.current = true;
    }
  }, [isEditing, replacePostDraft]);

  useEffect(() => {
    if (postQuery.data && !initializedRef.current) {
      replacePostDraft({
        title: postQuery.data.title,
        album_ids: postQuery.data.albums.map((album) => album.id),
        text: postQuery.data.text,
        is_published: postQuery.data.is_published,
        pub_date: postQuery.data.pub_date,
      });
      initializedRef.current = true;
    }
  }, [postQuery.data, replacePostDraft]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...postDraft,
        pub_date: postDraft.pub_date || new Date().toISOString(),
      };

      if (isEditing && elementId) {
        return updatePost(elementId, payload);
      }

      return createPost(payload);
    },
    onSuccess: async () => {
      resetDraft('posts');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['albums'] }),
      ]);
      navigate('/cms');
    },
  });

  const selectedAlbums = useMemo(() => {
    if (!albumsQuery.data) {
      return [];
    }

    const albumMap = new Map(albumsQuery.data.map((album) => [album.id, album]));
    return postDraft.album_ids
      .map((id) => albumMap.get(id))
      .filter((album): album is NonNullable<typeof album> => Boolean(album));
  }, [albumsQuery.data, postDraft.album_ids]);

  const availableAlbums = useMemo(() => {
    if (!albumsQuery.data) {
      return [];
    }

    const selected = new Set(postDraft.album_ids);
    return albumsQuery.data.filter((album) => !album.is_published && !selected.has(album.id));
  }, [albumsQuery.data, postDraft.album_ids]);

  if (postQuery.isError || albumsQuery.isError) {
    return <Alert severity="error">Failed to load post editor data.</Alert>;
  }

  return (
    <EntityFormScaffold
      title={isEditing ? 'Edit post' : 'Create post'}
      subtitle="A cleaner post builder with route-based navigation and preserved drag-and-drop album ordering."
      pubDate={postDraft.pub_date}
      isPublished={postDraft.is_published}
      onPubDateChange={(value) => patchPostDraft({ pub_date: value })}
      onPublishedChange={(value) => patchPostDraft({ is_published: value })}
      onCancel={() => navigate('/cms')}
      onSubmit={() => mutation.mutate()}
      submitLabel={mutation.isPending ? 'Saving...' : 'Save post'}
    >
      <Stack spacing={3}>
        <TextField
          label="Title"
          value={postDraft.title}
          onChange={(event) => patchPostDraft({ title: event.target.value })}
          fullWidth
        />
        <RichTextEditor value={postDraft.text} onChange={(text) => patchPostDraft({ text })} charLimit={500} minHeight={300} />
        <AlbumSelectionPanel
          availableAlbums={availableAlbums}
          selectedAlbums={selectedAlbums}
          onAddAlbum={(albumId) => patchPostDraft({ album_ids: [...postDraft.album_ids, albumId] })}
          onRemoveAlbum={(albumId) => patchPostDraft({ album_ids: postDraft.album_ids.filter((id) => id !== albumId) })}
          onReorder={(albumIds) => patchPostDraft({ album_ids: albumIds })}
        />
      </Stack>
    </EntityFormScaffold>
  );
}
