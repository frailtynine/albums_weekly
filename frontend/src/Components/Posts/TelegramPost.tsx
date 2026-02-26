import { Box, Typography, Button, Alert } from "@mui/material";
import { PostResponce, TelegramText, AlertInterface, PodcastResponse, AlbumResponse } from "../../interface";
import { fetchModel, postModel } from "../../api";
import { useState, useEffect } from "react";
import TipTapEditor from "../Misc/EditorView";
import MainTable from "../Misc/MainTable";
import { useComponent } from "../Misc/Context";



interface ErrorResponse {
  response: {
    data: {
      detail: string;
    };
  };
}

interface TelegramPostProps {
  elementId?: number;
  endpoint?: string
}

export default function TelegramPost ({elementId, endpoint }: TelegramPostProps) {
  const [post, setPost] = useState<PostResponce>();
  const [podcast, setPodcast] = useState<PodcastResponse>();
  const [album, setAlbum] = useState<AlbumResponse>();
  const [telegramText, setTelegramText] = useState<string>('');
  const [alert, setAlert] = useState<AlertInterface>();
  const { setCurrentComponent } = useComponent();


  useEffect(() => {
      if (elementId && endpoint) {
        fetchModel(endpoint, elementId)
          .then(data => {
            if (endpoint === 'posts') {
              setPost(data);
            } else if (endpoint === 'podcasts') {
              setPodcast(data);
            } else if (endpoint === 'albums') {
              setAlbum(data);
              setTelegramText(data.telegram || '');
              console.log(telegramText);
            }
            
          })
          .catch(error => {
            console.error(error);
          });
      }
  }, [elementId, endpoint]);

  const handlePostToTelegram = async () => {
    if (telegramText) {
      const payload: TelegramText = {text: telegramText};
      try {
        await postModel('posts/send_to_telegram', payload);
        setCurrentComponent(<MainTable />);
      }
      catch (error) {
        const errorMessage = error as ErrorResponse;
        setAlert({
          severity: 'error',
          message: errorMessage.response.data.detail
        });
      }
    }
  }

  return (
    <Box sx={{  display: 'flex', flexDirection: 'column', height: '80vh', mt: 1, }}>
          {endpoint === 'posts' && post && (
          <Typography variant="h5" sx={{ padding: 0.5 }}>{post.title}</Typography>
          )}
            {alert && (<Alert severity={alert.severity}>{alert.message}</Alert>)}
            <TipTapEditor 
              textValue={endpoint === 'podcasts' ? podcast?.text || '' : endpoint === 'albums' ? album?.telegram || '' : post?.telegram_content || ''}   
              setTextValue={setTelegramText} 
              charLimit={4000} 
              key={post?.id || podcast?.id}
              height="63vh"
              width="60vw"
            />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'flex-end', mt: 1}}>
          <Button variant='contained' onClick={() => handlePostToTelegram()}>Post to Telegram</Button>
          <Button variant='contained' onClick={() => setCurrentComponent(<MainTable />)}>Cancel</Button>
        </Box>
  </Box>
  );
}
