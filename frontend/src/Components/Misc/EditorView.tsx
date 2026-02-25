import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, Chip } from "@mui/material";
import { useEffect, useCallback } from "react";
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';



interface EditorProps {
  textValue: string;
  setTextValue: (value: string) => void;
  charLimit?: number;
  youtube?: boolean;
  width?: string;
  height?: string;
}


export default function TipTapEditor ({
  textValue, setTextValue, charLimit = 4000, youtube = false, width='auto', height='auto'
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: false
      }),
      CharacterCount.configure({
        limit: charLimit,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        width: 548,
        height: 331
      }),
    ],
    content: textValue,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor }) => {
      setTextValue(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  useEffect(() => {
    if (editor && textValue !== editor.getHTML()) {
      editor.commands.setContent(textValue);
    }
  }, [textValue, editor]);
  
  
  const percentage = editor
    ? Math.round((100 / charLimit) * editor.storage.characterCount.characters())
    : 0

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink()
        .run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url })
      .run()
  }, [editor])


  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
      })
    }
  }


  return (
   <Box>
    <Box sx={{ marginBottom: '6px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <Chip onClick={() => editor.chain().focus().toggleBold().run()} label='Bold'/>
      <Chip onClick={() => editor.chain().focus().toggleItalic().run()} label='Italic'/>
      <Chip onClick={setLink} label='Link'/>
      <Chip onClick={() => editor.chain().focus().unsetLink().run()} label='Unlink'/>
      {youtube && <Chip onClick={addYoutubeVideo} label='Youtube'/>}
      {charLimit && (
      <Box
        sx={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
      <div className={`character-count ${editor.storage.characterCount.characters() === charLimit ? 'character-count--warning' : ''}`}>
        <svg
          height="20"
          width="20"
          viewBox="0 0 20 20"
          style={{ marginRight: '8px' }}
        >
          <circle
            r="10"
            cx="10"
            cy="10"
            fill="#e9ecef"
          />
          <circle
            r="5"
            cx="10"
            cy="10"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
            transform="rotate(-90) translate(-20)"
          />
          <circle
            r="6"
            cx="10"
            cy="10"
            fill="white"
          />
        </svg>
        
        {editor.storage.characterCount.characters()} / {charLimit} characters
      </div>
      </Box>
      )}
    </Box>
      <Box
        sx={{
          textAlign: 'left',
          minHeight: '200px',
          height: height,
          width: width,  
          border: '1px solid #ccc',  
          borderRadius: '8px',  
          padding: '12px',  
          backgroundColor: '#fff',
          whiteSpace: 'pre-wrap', 
          overflow: 'auto',
          '& .ProseMirror': {
            minHeight: '200px', 
            outline: 'none',  
            fontFamily: 'Roboto, sans-serif',  
            fontSize: '16px',
          }
        }}
      >
          
      <EditorContent editor={editor}/>
     </Box>
   </Box> 
  )
};