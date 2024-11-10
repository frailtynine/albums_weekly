import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { fetchModels } from "../../api";
import { PostResponce, AlbumResponse, TextResponse } from "../../interface";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AlbumIcon from '@mui/icons-material/Album';
import { SvgIconComponent } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import AlbumCreateForm from "../Albums/AlbumForm";
import PostForm from "../Posts/PostForm";
import TextForm from "../Texts/TextForm";
import { useComponent } from "./Context";
import DeleteDialog from "./DeleteDialog";
import DeleteIcon from '@mui/icons-material/Delete';
import TelegramPost from "../Posts/TelegramPost";
import PostAddIcon from '@mui/icons-material/PostAdd';


interface IconMapInterface {
  [key: string]: SvgIconComponent;
}

export default function MainTable() {
  const iconMapping: IconMapInterface = {
    posts: NewspaperIcon,
    albums: AlbumIcon,
    texts: PostAddIcon,
  };
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { setCurrentComponent } = useComponent();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [endpoint, setEndpoint] = useState<string>('');
  const [refresh, setRefresh] = useState<boolean>(false);

  const columns: GridColDef<any>[] = [
    {
      field: 'type',
      headerName: 'Type',
      width: 90,
      renderCell: (params ) => {
        const IconComponent = iconMapping[params.value] || NewspaperIcon;
        return (
          <IconComponent />
        )
      }
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 400,
      renderCell: (params) => {
        const {title, elementId, component: Component} = params.value;
        return (
          <div 
            onClick={() => setCurrentComponent(<Component elementId={elementId} />)} 
            style={{ cursor: 'pointer' }}
          >
            {title}
          </div>
        )
      }
    },
    {field: 'date', headerName: 'Date', width: 120},
    {field: 'is_published', headerName: 'Published', width: 90},
    {
      field: 'tg',
      headerName: 'Telegram',
      width: 120,
      renderCell: (params) => {
        if (params.row.type === 'posts') {
          return (
            <Button variant='contained' onClick={() => setCurrentComponent(<TelegramPost elementId={params.row.title.elementId} />)}>
              Post
            </Button>
          )
        }
      }
    },
    {field: 'substack', headerName: 'Substack', width: 120},
    {
      field: 'delete',
      headerName: 'Delete',
      width: 120,
      renderCell: (params) => {
        return (
          <IconButton onClick={() => {
            setEndpoint(params.row.type);
            setItemToDelete(params.row.title.elementId);
            setDeleteDialogOpen(true);
          }}>
            <DeleteIcon />
          </IconButton>
        )
    },
  }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await fetchModels('posts/');
        
        const postRows = posts.map((post: PostResponce) => ({
          id: `${post.id}-post`,
          type: 'posts',
          title: {title: post.title, elementId: post.id, component: PostForm},
          date: post.pub_date,
          is_published: post.is_published ? 'Yes' : 'No',
          delete: post.id,
        }));

        const albums = await fetchModels('albums');
        const albumRows = albums.map((album: AlbumResponse) => ({
          id: `${album.id}-album`,
          type: 'albums',
          title: {title: album.band_name, elementId: album.id, component: AlbumCreateForm},
          date: album.pub_date,
          is_published: album.is_published ? 'Yes' : 'No',
        }));

        const texts = await fetchModels('texts');
        const textRows = texts.map((text: TextResponse) => ({
          id: `${text.id}-text`,
          type: 'texts',
          title: {title: text.title, elementId: text.id, component: TextForm},
          date: text.pub_date,
          is_published: text.is_published ? 'Yes' : 'No',
        }));

        setRows([...postRows, ...albumRows, ...textRows]);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  const handleRefresh = () => { setRefresh(prev => !prev) };


  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh' }}>
      <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: {
        paginationModel: {
          pageSize: 15,
        },
        },
        sorting: {
        sortModel: [
          { field: 'date', sort: 'desc' }
        ],
        },
      }}
      pageSizeOptions={[15]}
      sx={{ overflowY: 'auto' }}
      />
      <DeleteDialog 
        endpoint={endpoint}
        id={itemToDelete}
        isOpen={deleteDialogOpen}
        openDeleteDialog={setDeleteDialogOpen}
        handleRefresh={handleRefresh}
      />
    </Box>
  )
}