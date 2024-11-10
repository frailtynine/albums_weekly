import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { AlbumResponse, AlbumRequest } from "../../interface";
import { fetchSonglinkData, postAlbum, updateAlbum, fetchModel } from "../../api";
import Button from '@mui/material/Button';
import MainTable from "../Misc/MainTable";
import { useComponent } from "../Misc/Context";

interface AlbumCreateFormProps {
  elementId?: number | null;
}

export default function AlbumCreateForm({elementId}: AlbumCreateFormProps) {
  const { setCurrentComponent } = useComponent();
  const [albumData, setAlbumData] = useState<AlbumRequest>(
    {
      album_name: '',
      text: '',
      band_name: '',
      spotify_url: '',
      url: '',
      image_url: '',
      links: {},
      is_published: false,
      pub_date: ''
    }
  );
  const [songlinkError, setSonglinkError] = useState<string>();

  useEffect(() => {
    fetchAlbum();
  }, [elementId])


  const fetchAlbum = async () => {
    if (elementId) {
      try {
        const albumToUpdate: AlbumResponse = await fetchModel('albums', elementId);
        const { id, ...filteredAlbumData } = albumToUpdate;
        setAlbumData(filteredAlbumData);
      } catch (err) {
        console.error('Error fetching album:', err);
      }
    }
  };

  const handleSonglinkData = async (url: string) => {
    try {
      const response = await fetchSonglinkData(url);
      console.log(response)
      setAlbumData((prevData) => ({
        ...prevData,
        ...response
      }));
    }
    catch (err) {
      console.log(err);
      setSonglinkError('Something wrong, try again');
    }
  }

  const handlePaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    setSonglinkError('');
    const pastedText = event.clipboardData.getData('text');
    await handleSonglinkData(pastedText); 
  };

  const handleSubmit = async () => {
    if (elementId) {
      try {
        await updateAlbum(elementId, albumData);
        setCurrentComponent(<MainTable />);
      }
      catch (error) {
        console.error(error);
      }
    }
    else {
      try {
        await postAlbum(albumData);
        setCurrentComponent(<MainTable />);
      }
      catch (error) {
        console.error(error);
      }
    }
  }
  
  return (
    <Box component="form" autoComplete="off" sx={{ padding: 3, width: 800, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1}}>
          <TextField
            sx={{paddingRight: 1}}
            id="outlined-basic"
            fullWidth
            label="Band name"
            variant="outlined"
            onChange={(e) => setAlbumData((prevData) => ({
              ...prevData,
              band_name: e.target.value
            }))} 
            value={albumData.band_name || ''}
          />
          <TextField
            sx={{paddingLeft: 1}}
            id="outlined-basic"
            fullWidth
            label="Album name"
            variant="outlined"
            onChange={(e) => setAlbumData((prevData) => ({
                ...prevData,
                album_name: e.target.value
              }))}
            value={albumData.album_name || ''}
          />
        </Box>
      <Box sx={{mb: 1}}>
      <TextField
        fullWidth
        id="outlined-multiline-static"
        label="Album review text"
        multiline
        rows={8}
        onChange={(e) => setAlbumData((prevData) => ({
          ...prevData,
          text: e.target.value
        }))}
        value={albumData.text}
      />
      </Box>
      <Box sx={{mb: 1}}>
      <TextField 
        id="outlined-basic"
        label="Album link"
        variant="outlined"
        fullWidth
        value={albumData.spotify_url}
        onPaste={handlePaste}
        onChange={(e) => setAlbumData((prevData) => ({
          ...prevData,
          spotify_url: e.target.value
        }))}
        helperText={songlinkError}
      />
      </Box>
      <Box>
        <Button
          sx={{margin: 1}}
          variant="contained"
          onClick={() => handleSubmit()}
        >
          Submit
        </Button>
        <Button
          sx={{margin: 1}} 
          variant="contained"
          onClick={() => setCurrentComponent(<MainTable />)}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}