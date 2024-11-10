import { Box, Typography, Button, Alert } from "@mui/material";
import { PostResponce, TelegramText, AlertInterface } from "../../interface";
import { fetchModel, getImages, postModel } from "../../api";
import { useState, useEffect } from "react";
import AlbumChips from "../Albums/AlbumChips";
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
  elementId: number;
}

export default function TelegramPost ({elementId}: TelegramPostProps) {
  const [post, setPost] = useState<PostResponce>();
  const [telegramText, setTelegramText] = useState<string>('');
  const [alert, setAlert] = useState<AlertInterface>();
  const { setCurrentComponent } = useComponent();

  useEffect(() => {
    fetchModel('posts', elementId)
    .then(post => {
      setPost(post);
    })
    .catch(error => {
      console.error(error)
    })
  }, [])


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
      {post && (
        <Box>
          <Typography variant="h4" sx={{ padding:1 }}>{post.title}</Typography>
          <Box sx={{ display: 'flex', gap: '16px' }}>
            <Box sx={{ flex: 1 }}>
              <AlbumChips albums={post.albums}/>
                <Button onClick={() => getImages(post.id)} sx={{ flex: 1}}>Get Images</Button>
            </Box>
            <Box sx={{ flex: 3, overflowY: 'auto', height: '80vh'}}>
              {alert && (<Alert severity={alert.severity}>{alert.message}</Alert>)}
              <TipTapEditor textValue={post.telegram_content} setTextValue={setTelegramText} charLimit={4000} key={post.id}/>
            </Box>
        </Box>
            <Button variant='contained' onClick={() => handlePostToTelegram()}>Post to Telegram</Button>
            <Button variant='contained' onClick={() => setCurrentComponent(<MainTable />)}>Cancel</Button>
        </Box>
      )}
    </Box>
  </Box>
  );
}
