import { fetchModels } from "../../api";
import { useState, useEffect } from "react";
import { TextResponse } from "../../interface";
import TextForm from "./TextForm";
import { List, ListItem, Box, Typography, Button } from "@mui/material";


interface TextProps {
  onEdit: (Component: React.ElementType, props: {textId: number}) => void;
}

export default function TextList ({onEdit}: TextProps) {
  const [texts, setTexts] = useState<TextResponse[]>([]);

  useEffect(() => {
    fetchModels('texts')
    .then(fetchedTexts => {
      setTexts(fetchedTexts);
    })
    .catch(error => {console.error(error)})
  }, []);

  return (
    <Box>
      <List>
        {texts && texts.map(text => (
          <ListItem key={text.id}>
          <Box sx={{ display: 'flex', flexDirection: 'row'}}>
            <Typography sx={{flex: 4}}>{text.title}</Typography>
            <Button onClick={() => onEdit(TextForm, {textId: text.id})}>Edit</Button>
          </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}