import { Box, Typography, Button, Alert } from "@mui/material";
import { PostResponce, TelegramText, AlertInterface, PodcastResponse } from "../../interface";
import { fetchModel, postModel } from "../../api";
import { useState, useEffect } from "react";
import AlbumChips from "../Albums/AlbumChips";
import TipTapEditor from "../Misc/EditorView";
import MainTable from "../Misc/MainTable";
import { useComponent } from "../Misc/Context";
import ShareImage from "../Misc/ShareImage";



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
  const [telegramText, setTelegramText] = useState<string>('');
  const [alert, setAlert] = useState<AlertInterface>();
  const { setCurrentComponent } = useComponent();

  useEffect(() => {
    if (elementId && endpoint) {
      fetchModel(endpoint, elementId)
      .then(data => {
        if (endpoint === 'posts') {
          setPost(data);
        }
        else if (endpoint === 'podcasts') {
          setPodcast(data);
        }
      })
      .catch(error => {
        console.error(error)
      })
    }
  }, [])


  const handleGetImages = () => {
    if (post?.albums) {
      setCurrentComponent(<ShareImage albums={post.albums} />);
    }
  };

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
    <Box sx={{  display: 'flex' }}>
    <Box sx={{ flex: 3, overflowY: 'auto' }}>
        <Box>
            {endpoint === 'posts' && post && (
            <Typography variant="h4" sx={{ padding:1 }}>{post.title}</Typography>
            )}
          <Box sx={{ display: 'flex', gap: '16px' }}>
            {endpoint === 'posts' && post && (
            <Box sx={{ flex: 1 }}>
              <AlbumChips albums={post.albums}/>
          <Button variant="contained" onClick={handleGetImages} sx={{ flex: 1}}>Get Images</Button>
            </Box>
            )}
            <Box sx={{ flex: 3, overflowY: 'auto', height: '80vh'}}>
              {alert && (<Alert severity={alert.severity}>{alert.message}</Alert>)}
              <TipTapEditor 
              textValue={endpoint === 'podcasts' ? podcast?.text || '' : post?.telegram_content || ''} 
              setTextValue={setTelegramText} 
              charLimit={4000} 
              key={post?.id || podcast?.id}
              />
            </Box>
        </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'flex-end'}}>
            <Button variant='contained' onClick={() => handlePostToTelegram()} sx={{ margin: '10px' }}>Post to Telegram</Button>
            <Button variant='contained' onClick={() => setCurrentComponent(<MainTable />)} sx={{ margin: '10px' }}>Cancel</Button>
          </Box>
        </Box>
    </Box>
  </Box>
  );
}
