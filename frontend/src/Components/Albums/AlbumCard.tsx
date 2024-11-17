import { Box, Typography, Grid2, Tooltip, IconButton, CircularProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { fetchModel } from '../../api';
import { AlbumResponse } from '../../interface';
import { useState, useEffect } from 'react';
import { BASE_URL } from '../../api';
import AlbumCreateForm from './AlbumForm';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';


interface AlbumCardProps {
  id: number;
  onEdit?: (Component: React.ElementType, props: {albumId: number}) => void;
  hideButtons?: boolean;
  onDelete?: (albumId: number) => void;
}


export default function AlbumCard({id, onEdit, hideButtons, onDelete}: AlbumCardProps) {
  const [albumData, setAlbumData] = useState<AlbumResponse>();
  const [loading, setLoading] = useState<boolean>(true); 
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  useEffect(() => {
    fetchModel('albums', id)
      .then(album => {
        setAlbumData(album);
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load album', error)
      });
  }, [id]);


  if (loading) {
    return (<CircularProgress />)
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: 400, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
    ref={setNodeRef} style={style} {...attributes} {...listeners}
    >
      <Grid2 container alignItems='center'>
        <Grid2 size={3} padding={1}>
          <img
            src={`${BASE_URL}${albumData?.image_url}`}
            alt={`${albumData?.album_name} cover`}
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Grid2>
        <Grid2 size={9} padding={1}>
          <Box>
            {(!hideButtons && (
            <Grid2 size={12} sx={{display: 'flex' ,justifyContent: 'flex-end'}}>
            {onEdit && (
            <Tooltip title="Edit Album">
              <IconButton size="small" onClick={() => onEdit(AlbumCreateForm, {albumId: id})}>
                <Edit />
              </IconButton>
            </Tooltip>
            )}
            {onDelete && (
            <Tooltip title="Delete Album">
              <IconButton size="small" onMouseUp={() => onDelete(id)}>
                <Delete />
              </IconButton>
            </Tooltip>
            )}
           </Grid2>
          ))}
            <Grid2 size={12}>
            <Typography gutterBottom variant="h6" component="div">
              {albumData?.band_name} — {albumData?.album_name}
            </Typography>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  )
}
