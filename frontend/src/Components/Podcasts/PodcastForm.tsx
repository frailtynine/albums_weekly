import { fetchModel, postModel, updateModel } from "../../api";
import { PodcastRequest, PodcastResponse } from "../../interface";
import { useState, useEffect } from "react";
import PodcastList from "./PodcastList";
import TipTapEditor from "../Misc/EditorView";
import axios from "axios";
import { Box, Button, TextField } from "@mui/material";
import getYouTubeID from "get-youtube-id";
import { useComponent } from "../Misc/Context";
import MainTable from "../Misc/MainTable";

interface PodcastFormProps {
  podcastId?: number;
}

export default function PodcastForm ({podcastId}: PodcastFormProps) {
  const [podcastData, setPodcastData] = useState<PodcastRequest>({
    yt_id: '',
    title: '',
    text: '',
    is_published: false
  });
  const apiKey: string = import.meta.env.VITE_YT_API;
  const [youtubeError, setYoutubeError] = useState<string>();
  const { setCurrentComponent } = useComponent();

  useEffect(() => {
    if (podcastId) {
      fetchModel('podcasts', podcastId)
      .then(fetchedPodcast => {
        setPodcastData(fetchedPodcast);
      })
      .catch(error => {console.error(error)})
    }
  }, [])

  const handleSubmit = async () => {
    try {
      if (podcastId) {
        updateModel('podcasts', podcastId, podcastData);
        setCurrentComponent(<MainTable />);
      }
      else {
        postModel('podcasts', podcastData);
        setCurrentComponent(<MainTable />);
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  const getYtData = async (videoId: string) => {
    try {
      const response = await axios.get<any>(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
      )
      console.log(response);
      setPodcastData((prev) => ({
        ...prev,
        yt_id: videoId,
        text: response.data.items[0].snippet.description.replace(/\n/g, '<br>') || '',
        title: response.data.items[0].snippet.title || '',
      }));
    }
    catch (error) {
      console.error(error);
    }
  }

  const handlePaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text');
    const ytId = getYouTubeID(pastedText);
    setYoutubeError('');
    if (ytId) {
      await getYtData(ytId);
      console.log(podcastData.text);
    }
    else {
      setYoutubeError('Invalid YouTube URL');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        id="outlined-basic"
        onPaste={handlePaste}
        label="YouTube URL"
        variant="outlined"
        helperText={youtubeError}
      />
      <TipTapEditor
        textValue={podcastData.text}
        setTextValue={(text: string) => setPodcastData((prev) => ({...prev, text}))}
        charLimit={4000}
      />
      <Button onClick={handleSubmit}>Submit</Button>
      <Button onClick={() => setCurrentComponent(<MainTable />)}>Cancel</Button>
    </Box>
  )
}