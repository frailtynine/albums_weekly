import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  charLimit?: number;
  youtube?: boolean;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  charLimit = 4000,
  youtube = false,
  minHeight = 260,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: false }),
      CharacterCount.configure({ limit: charLimit }),
      Youtube.configure({ controls: false, nocookie: true, width: 548, height: 331 }),
    ],
    content: value,
    parseOptions: { preserveWhitespace: 'full' },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const characters = editor.storage.characterCount.characters();

  const promptLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertYoutube = () => {
    const url = window.prompt('Enter YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap" alignItems={{ sm: 'center' }}>
        <Chip label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} />
        <Chip label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Chip label="Link" onClick={promptLink} />
        <Chip label="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} />
        {youtube && <Chip label="YouTube" onClick={insertYoutube} />}
        <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
          {characters} / {charLimit} characters
        </Typography>
      </Stack>
      <Box
        className="cms-editor"
        sx={{
          mt: 2,
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(4, 8, 16, 0.55)',
          minHeight,
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Card>
  );
}
