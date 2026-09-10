import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Stack, TextField } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createText, fetchText, updateText } from '../api/cmsApi';
import EntityFormScaffold from '../components/EntityFormScaffold';
import RichTextEditor from '../components/RichTextEditor';
import { emptyTextDraft, useCmsStore } from '../state/cmsStore';

export default function TextEditorScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const elementId = params.id ? Number(params.id) : null;
  const isEditing = Boolean(elementId);
  const textDraft = useCmsStore((state) => state.textDraft);
  const replaceTextDraft = useCmsStore((state) => state.replaceTextDraft);
  const patchTextDraft = useCmsStore((state) => state.patchTextDraft);
  const resetDraft = useCmsStore((state) => state.resetDraft);
  const initializedRef = useRef(false);
  const wasPublishedRef = useRef(false);

  const textQuery = useQuery({
    queryKey: ['text', elementId],
    queryFn: () => fetchText(elementId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!isEditing && !initializedRef.current) {
      replaceTextDraft(emptyTextDraft);
      initializedRef.current = true;
    }
  }, [isEditing, replaceTextDraft]);

  useEffect(() => {
    if (textQuery.data && !initializedRef.current) {
      wasPublishedRef.current = textQuery.data.is_published;
      replaceTextDraft(textQuery.data);
      initializedRef.current = true;
    }
  }, [replaceTextDraft, textQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...textDraft,
        pub_date:
          isEditing && !wasPublishedRef.current && textDraft.is_published
            ? new Date().toISOString()
            : textDraft.pub_date || new Date().toISOString(),
      };

      if (isEditing && elementId) {
        return updateText(elementId, payload);
      }

      return createText(payload);
    },
    onSuccess: async () => {
      resetDraft('texts');
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/cms');
    },
  });

  if (textQuery.isError) {
    return <Alert severity="error">Failed to load text data.</Alert>;
  }

  return (
    <EntityFormScaffold
      title={isEditing ? 'Edit text' : 'Create text'}
      subtitle="Long-form text editing with draft persistence and embedded video support."
      pubDate={textDraft.pub_date}
      isPublished={textDraft.is_published}
      onPubDateChange={(value) => patchTextDraft({ pub_date: value })}
      onPublishedChange={(value) => patchTextDraft({ is_published: value })}
      onCancel={() => navigate('/cms')}
      onSubmit={() => mutation.mutate()}
      submitLabel={mutation.isPending ? 'Saving...' : 'Save text'}
    >
      <Stack spacing={2}>
        <TextField
          label="Title"
          value={textDraft.title}
          onChange={(event) => patchTextDraft({ title: event.target.value })}
          fullWidth
        />
        <RichTextEditor value={textDraft.content} onChange={(content) => patchTextDraft({ content })} charLimit={8000} youtube />
      </Stack>
    </EntityFormScaffold>
  );
}
