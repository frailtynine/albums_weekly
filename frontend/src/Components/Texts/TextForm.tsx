import TipTapEditor from "../Misc/EditorView";
import { Box, TextField, Checkbox, Typography, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { TextRequest } from "../../interface";
import { postModel, fetchModel, updateModel } from "../../api";
import MainTable from "../Misc/MainTable";
import { useComponent } from "../Misc/Context";
import dayjs from "dayjs";
import CustomDateTimePicker from "../Misc/CustomDateTimePicker";

interface TextFormProps {
  elementId?: number;
}

interface SavedText {
  title: string | null;
  content: string | null;
}


export default function TextForm ({elementId}: TextFormProps) {
  const { setCurrentComponent } = useComponent();
  const [textData, setTextData] = useState<TextRequest>({
    title: '',
    content: '',
    is_published: false,
    pub_date: ''
  });

  useEffect(() => {
    if (!elementId) {
      const savedText: SavedText = {
        title: localStorage.getItem('textTitle'),
        content: localStorage.getItem('textContent')
      };
      if (savedText.title || savedText.content) {
        setTextData((prev: any) => ({
          ...prev,
          title: savedText.title || '',
          content: savedText.content || ''
        }));
      }
    }
    else {
      fetchModel('texts', elementId)
      .then(text => {
        setTextData(text);
      })
      .catch(error => {console.error(error)})
    }
  },[]);

  const handleFieldChange = (field: 'title' | 'content', value: string) => {
    setTextData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
    
    localStorage.setItem(`text${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
  };

  const handleSubmit = async () => {
    try {
      if (elementId) {
        await updateModel('texts', elementId, textData);
        setCurrentComponent(<MainTable />);
      }
      else {
        if (textData.pub_date === '') {
          textData.pub_date = new Date().toISOString();
        }
        await postModel('texts/create', textData);
        setCurrentComponent(<MainTable />);
      }
      localStorage.removeItem('textTitle');
      localStorage.removeItem('textContent');
    }
    catch (error) {
      console.error(error);
    }
  }
  

  return (
    <Box sx={{ height: '80vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
        <CustomDateTimePicker
          label="Publication date"
          value={textData.pub_date ? dayjs(textData.pub_date) : null}
          onChange={(newValue) => {
            setTextData((prevData) => ({
              ...prevData,
              pub_date: newValue ? newValue.toISOString() : ''
            }))
          }}
        />
      </Box>
      <TextField
        id="outlined-basic"
        fullWidth
        label="Title"
        variant="outlined"
        value={textData?.title}
        onChange={(e) => handleFieldChange('title', e.target.value)}
        sx={{ marginBottom: '5px'}}
      />

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
      <TipTapEditor
        textValue={textData?.content || ''}
        setTextValue={(value) => handleFieldChange('content', value)}
        charLimit={8000}
        youtube={true}
        width="40vw"
        height="65vh"
      />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '5px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            value={textData.is_published}
            onChange={(event) => setTextData((prev: any) => ({...prev, is_published: event.target.checked}))}
            aria-label="Publish" 
          />
          <Typography variant="h6">Publish</Typography>
        </Box>
        <Button variant="contained" onClick={() => handleSubmit()}>
            Submit
        </Button>
        <Button variant="contained" onClick={() => setCurrentComponent(<MainTable />)}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}