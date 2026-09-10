import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { fetchDashboardData } from '../api/cmsApi';

const createActions = [
  { label: 'New album', path: '/cms/albums/new' },
  { label: 'New post', path: '/cms/posts/new' },
  { label: 'New text', path: '/cms/texts/new' },
  { label: 'New podcast', path: '/cms/podcasts/new' },
];

export default function CmsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  const summary = dashboardQuery.data
    ? [
        { label: 'Posts', value: dashboardQuery.data.posts.length },
        { label: 'Albums', value: dashboardQuery.data.albums.length },
        { label: 'Texts', value: dashboardQuery.data.texts.length },
        { label: 'Podcasts', value: dashboardQuery.data.podcasts.length },
      ]
    : [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/', { replace: true });
  };

  const sidebarContent = (
    <Box className="cms-sidebar">
      <Stack spacing={2}>
        <Button
          variant={location.pathname === '/cms' ? 'contained' : 'text'}
          startIcon={<DashboardRoundedIcon />}
          onClick={() => {
            navigate('/cms');
            setMobileMenuOpen(false);
          }}
          sx={{ justifyContent: 'flex-start' }}
        >
          Dashboard
        </Button>
        <Button
          variant={location.pathname.startsWith('/cms/telegram') ? 'contained' : 'text'}
          startIcon={<TelegramIcon />}
          onClick={() => {
            navigate('/cms/telegram');
            setMobileMenuOpen(false);
          }}
          sx={{ justifyContent: 'flex-start' }}
        >
          Telegram composer
        </Button>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Create
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {createActions.map((action) => (
              <Chip
                key={action.path}
                clickable
                icon={<AddCircleOutlineRoundedIcon />}
                label={action.label}
                onClick={() => {
                  navigate(action.path);
                  setMobileMenuOpen(false);
                }}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Overview
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {summary.map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.04)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
        <Button
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          onClick={handleLogout}
          sx={{ justifyContent: 'flex-start', mt: 'auto' }}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box className="cms-shell">
      <AppBar position="sticky" color="transparent" elevation={0} className="cms-appbar">
        <Toolbar sx={{ gap: 2 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileMenuOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Albums Weekly CMS
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className="cms-frame">
        {!isMobile && sidebarContent}
        <Box className="cms-main">
          <Outlet />
        </Box>
      </Container>
      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        {sidebarContent}
      </Drawer>
    </Box>
  );
}
