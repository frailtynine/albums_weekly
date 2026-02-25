import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import PostForm from '../Posts/PostForm';
import TextForm from '../Texts/TextForm';
import { CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../../api';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import AlbumCreateForm from '../Albums/AlbumForm';
import PodcastForm from '../Podcasts/PodcastForm';
import AlbumIcon from '@mui/icons-material/Album';
import PostAddIcon from '@mui/icons-material/PostAdd';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { Podcasts } from '@mui/icons-material';
import { Box } from '@mui/material';
import MainTable from '../Misc/MainTable';
import { useComponent } from '../Misc/Context';
import LogoutButton from '../Misc/LogoutButton';



export default function ClippedDrawer() {
  const { currentComponent, setCurrentComponent } = useComponent();
  const handleComponentChange = (Component: React.ElementType, props: any = {}) => {
    setCurrentComponent(<Component {...props}/>);
  };
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  
  const speedDialMenu = [
      {name: 'Album', element: AlbumCreateForm, icon: AlbumIcon, props: {onClose: handleComponentChange}},
      {name: 'Take', element: TextForm, icon: PostAddIcon},
      {name: 'Post', element: PostForm, icon: NewspaperIcon, props: {onAlbumEdit: handleComponentChange, unpublished: true, onClose: handleComponentChange}},
      {name: 'Podcast', element: PodcastForm, icon: Podcasts, }
  ];  

  useEffect(() => {
        verifyToken()
        .then(() => {
          handleComponentChange(MainTable);
          setLoading(false);
        } 
        )
        .catch(error => {
          console.error(error)
          navigate('/')
        });
  }, [])

    
  if (loading) {
    return <CircularProgress />
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              onClick={() => handleComponentChange(MainTable)}
              sx={{ cursor: 'pointer' }}
            >
              Albums Weekly Command Centre
            </Typography>
            <Box sx={{ ml: 'auto'}}>
              <LogoutButton />
            </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />
         {currentComponent}
      </Box>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'fixed', bottom: 16, right: 16  }}
        icon={<SpeedDialIcon />}
      >
        {speedDialMenu.map((action) => (
          <SpeedDialAction
            key={action.name}
            tooltipTitle={action.name}
            icon={<action.icon />}
            onClick={() => handleComponentChange(action.element, action.props)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
