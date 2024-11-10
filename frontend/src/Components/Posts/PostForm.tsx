import { fetchModel, fetchModels, postModel} from "../../api";
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
    text: ''
  });
  const [selectedAlbums, setSelectedAlbums] = useState<number[]>([]);
  const [unpublishedAlbums, setUpublishedAlbums] = useState<AlbumResponse[]>([]);
  const [publish, setPublish] = useState<boolean>();
  
  const fetchPost = async () => {
    if (elementId) {
      try {
        const fetchedData: PostResponce = await fetchModel('posts', elementId);
        const album_ids = fetchedData.albums.map(album => album.id);
        setPostData({
          title: fetchedData.title,
          album_ids: album_ids,
          text: fetchedData.text
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
      setUpublishedAlbums(filteredAlbums);
    })
    .catch(error => {
      console.log(error);
    })
  }, [])

  const onChipClick = (id: number) => {
    setSelectedAlbums(prevSelectedAlbums => [...prevSelectedAlbums, id]);
    setUpublishedAlbums(prevUnpublishedAlbums =>
      prevUnpublishedAlbums.filter(album => album.id !== id)
    );
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
      text: postData.text
    };
    let endpoint = 'posts/create'
    if (publish) {
      endpoint = 'posts/create?publish=true'
    }
    try {
      await postModel(endpoint, payload);
      setCurrentComponent(<MainTable />);
    }
    catch (error) {
      console.error(error);
    }
  };
  
  const handlePublishChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPublish(event.target.checked);
  };

  const handleFieldChange = (field: keyof PostData, value: string) => {
    setPostData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    
    localStorage.setItem(`post${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
  };
  
  
  return (
    <Box sx={{ width: '80vw', height: '80vh', display: 'flex' }}>
      <Box sx={{ flex: 9, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mb: 2 }}>
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
          />
        </Box>
        </Box>
        <Box  sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start',
          mt: 4  
        }}>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEvent}>
            <SortableContext
              items={selectedAlbums}
              strategy={verticalListSortingStrategy}
            >
              {selectedAlbums.map(albumId => (
                <AlbumCard id={albumId} key={albumId} />
              ))}
            </SortableContext>
          </DndContext>
        </Box>

     
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox onChange={handlePublishChange} aria-label="Publish" />
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
  
      <Box sx={{ flex: 3, marginLeft: '16px' }}>
        <AlbumChips onClick={onChipClick} albums={unpublishedAlbums} />
      </Box>
    </Box>
  );
  
}