import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { AlbumResponse, AlbumRequest } from "../../interface";
import { fetchSonglinkData, postAlbum, updateAlbum, fetchModel } from "../../api";
import Button from '@mui/material/Button';
import MainTable from "../Misc/MainTable";
import {Checkbox, Typography} from "@mui/material"; 
import { useComponent } from "../Misc/Context";
import CustomDateTimePicker from "../Misc/CustomDateTimePicker";
import dayjs from "dayjs";
import TipTapEditor from "../Misc/EditorView";


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
    } else {
      setAlbumData((prevData) => ({
        ...prevData,
        text: localStorage.getItem('albumText') || ''
      }))
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
        await postAlbum({
          ...albumData,
          pub_date: new Date().toISOString()
        });
        localStorage.removeItem('albumText');
        setCurrentComponent(<MainTable />);
      }
      catch (error) {
        console.error(error);
      }
    }
  }


  const handleFieldChange = (field: keyof AlbumRequest, value: string) => {
    setAlbumData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (!elementId) {
      localStorage.setItem(`album${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
    }
  };
  
  return (
    <Box component="form" autoComplete="off" sx={{ padding: 3, width: 800, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <CustomDateTimePicker
              label="Publication date"
              value={albumData.pub_date ? dayjs(albumData.pub_date) : null}
              onChange={(newValue) => {
                setAlbumData((prevData) => ({
                  ...prevData,
                  pub_date: newValue ? newValue.toISOString() : ''
                }))
              }}
            />
        </Box>
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
        <TipTapEditor
          textValue={albumData.text}
          setTextValue={(newText) => handleFieldChange('text', newText)}
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox 
            checked={albumData.is_published} 
            onChange={(e) => setAlbumData((prev) => ({ ...prev, is_published: e.target.checked ? true : false }))} 
            aria-label="Publish" 
          />
          <Typography variant="h6">Publish</Typography>
          </Box>
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