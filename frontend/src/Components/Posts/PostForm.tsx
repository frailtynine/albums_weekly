import { fetchModel, fetchModels, postModel, updateModel} from "../../api";
import { PostData, PostResponce, AlbumResponse } from "../../interface";
import AlbumChips from "../Albums/AlbumChips";
import AlbumCard from "../Albums/AlbumCard";
import { Box, TextField, Button, Checkbox, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TipTapEditor from "../Misc/EditorView";
import MainTable from "../Misc/MainTable";
import { useComponent } from "../Misc/Context";

interface PostFormProps {
  elementId?: number | null;
}

interface SavedPost {
  title: string | null;
  text: string | null;
}

export default function PostForm({elementId}: PostFormProps) {
  const { setCurrentComponent } = useComponent();
  const [postData, setPostData] = useState<PostData>({
    title: '',
    album_ids: [],
    text: '',
    is_published: false
  });
  const [selectedAlbums, setSelectedAlbums] = useState<number[]>([]);
  const [unpublishedAlbums, setUnpublishedAlbums] = useState<AlbumResponse[]>([]);
  
  const fetchPost = async () => {
    if (elementId) {
      try {
        const fetchedData: PostResponce = await fetchModel('posts', elementId);
        const album_ids = fetchedData.albums.map(album => album.id);
        setPostData({
          title: fetchedData.title,
          album_ids: album_ids,
          text: fetchedData.text,
          is_published: fetchedData.is_published
        });
        setSelectedAlbums(album_ids);
      }
      catch (error) {
        console.log(error);
      }
    }
  };
  
  useEffect(() => {
    if (!elementId) {
      const savedPost: SavedPost = {
        title: localStorage.getItem('postTitle'),
        text: localStorage.getItem('postText')
      };
      if (savedPost.title || savedPost.text) {
        setPostData((prev) => ({
          ...prev,
          title: savedPost.title || '',
          text: savedPost.text || ''
        }));
      }
    }
    fetchPost();
    fetchModels('albums')
    .then(albums => {
      const filteredAlbums: AlbumResponse[] = albums.filter(
        (album: { is_published: boolean; }) => !album.is_published
      )
      setUnpublishedAlbums(filteredAlbums);
    })
    .catch(error => {
      console.log(error);
    })
  }, []);

  const onChipClick = (id: number) => {
    setSelectedAlbums(prevSelectedAlbums => [...prevSelectedAlbums, id]);
    setUnpublishedAlbums(prevUnpublishedAlbums =>
      prevUnpublishedAlbums.filter(album => album.id !== id)
    );
  }

  const handleRemoveAlbum = async (albumId: number) => {
    const albumToAdd = await fetchModel('albums', albumId);
    if (albumToAdd) {
      setUnpublishedAlbums(prevUnpublishedAlbums => [
        ...prevUnpublishedAlbums, albumToAdd
      ]);
    }
    setSelectedAlbums(prevSelectedAlbums => prevSelectedAlbums.filter(oldId => oldId !== albumId));
  }

  const handleDragEvent = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id ){
      setSelectedAlbums((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  

  const  handleSubmit = async () => {
    const payload: PostData = {
      title: postData.title,
      album_ids: selectedAlbums,
      text: postData.text,
      is_published: postData.is_published
    };
    try {
      if (elementId) {
        await updateModel(`posts`, elementId, payload);
        setCurrentComponent(<MainTable />);
      }
      else {
        await postModel('posts/create', payload);
        setCurrentComponent(<MainTable />);
      }
    }
    catch (error) {
      console.error(error);
    }
  };
  

  const handleFieldChange = (field: keyof PostData, value: string) => {
    setPostData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    
    localStorage.setItem(`post${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
  };
  
  
  return (
    <Box sx={{ display: 'flex', mt: 2, height: '80vh'}}>
      <Box sx={{ flex: 8, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mr: 2 }}>
          <TextField
            id="outlined-basic"
            fullWidth
            label="Title"
            variant="outlined"
            value={postData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
          />
        <Box sx={{ mb: 2, mt: 2 }}>
          <TipTapEditor
            textValue={postData.text}
            setTextValue={(newText) => handleFieldChange('text', newText)}
            charLimit={500}
            height="40vh"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox 
              checked={postData.is_published} 
              onChange={(e) => setPostData((prev) => ({ ...prev, is_published: e.target.checked ? true : false }))} 
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
        
        <Box sx={{ marginLeft: '16px' }}>
          <AlbumChips onClick={onChipClick} albums={unpublishedAlbums} />
        </Box>
     
      </Box>
  
        <Box  sx={{ 
          flex: 4, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
        }}>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEvent}>
            <SortableContext
              items={selectedAlbums}
              strategy={verticalListSortingStrategy}
            >
              {selectedAlbums.map(albumId => (
                <Box key={albumId} sx={{ mb: 1 }}>
                  <AlbumCard id={albumId} key={albumId} onDelete={handleRemoveAlbum}/>
                </Box>
              ))}
            </SortableContext>
          </DndContext>
        </Box>
     
    </Box>
  );
  
}