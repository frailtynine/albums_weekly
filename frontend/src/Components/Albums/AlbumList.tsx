import { useEffect, useState } from "react";
import { List, ListItem, setRef } from "@mui/material";
import AlbumCard from "./AlbumCard";
import { fetchModels } from "../../api";
import { AlbumResponse } from "../../interface";
import {CircularProgress} from "@mui/material";

interface AlbumListProps {
  onEdit: (Component: React.ElementType, props: {albumId: number}) => void;
  unpublished?: boolean;
}

export default function AlbumList({ onEdit, unpublished}: AlbumListProps) {
  const [albumList, setAlbumsList] = useState<AlbumResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  
  useEffect(() => {
    fetchModels('albums')
    .then(albums => {
      if (unpublished) {
        const filteredAlbums: AlbumResponse[] = albums.filter(
          (album: { is_published: boolean; }) => !album.is_published
        );
        setAlbumsList(filteredAlbums);
      }
      else {
        setAlbumsList(albums);
      }
      setLoading(false);
    })
    .catch(error => {
      console.log(error);
    })
  }, [refresh])

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  }

  if (loading) {
    return (<CircularProgress />)
  }

  return (
    <List>
      {albumList.map(album => (
        <ListItem key={album.id} >
          <AlbumCard onEdit={onEdit} id={album.id} handleRefresh={handleRefresh}/>
        </ListItem>
      ))}
    </List>
  )
}