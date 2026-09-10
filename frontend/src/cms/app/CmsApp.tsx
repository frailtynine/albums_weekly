import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { verifyAuth } from '../api/cmsApi';
import CmsLayout from './CmsLayout';
import { cmsTheme } from './theme';
import DashboardScreen from '../screens/DashboardScreen';
import AlbumEditorScreen from '../screens/AlbumEditorScreen';
import PostEditorScreen from '../screens/PostEditorScreen';
import TextEditorScreen from '../screens/TextEditorScreen';
import PodcastEditorScreen from '../screens/PodcastEditorScreen';
import TelegramComposerScreen from '../screens/TelegramComposerScreen';
import ShareImagesScreen from '../screens/ShareImagesScreen';
import LoginPage from '../screens/LoginPage';
import './cms.css';

function AuthGate() {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('token'));
  const verifyQuery = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: verifyAuth,
    enabled: hasToken,
    retry: false,
  });

  if (!hasToken) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (verifyQuery.isPending) {
    return (
      <Box className="cms-loader">
        <CircularProgress />
      </Box>
    );
  }

  if (verifyQuery.isError) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default function CmsApp() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={cmsTheme}>
        <CssBaseline />
        <Box className="cms-root">
          <Routes>
            <Route index element={<LoginPage />} />
            <Route element={<AuthGate />}>
              <Route path="cms" element={<CmsLayout />}>
                <Route index element={<DashboardScreen />} />
                <Route path="albums/new" element={<AlbumEditorScreen />} />
                <Route path="albums/:id" element={<AlbumEditorScreen />} />
                <Route path="posts/new" element={<PostEditorScreen />} />
                <Route path="posts/:id" element={<PostEditorScreen />} />
                <Route path="posts/:id/share-images" element={<ShareImagesScreen />} />
                <Route path="texts/new" element={<TextEditorScreen />} />
                <Route path="texts/:id" element={<TextEditorScreen />} />
                <Route path="podcasts/new" element={<PodcastEditorScreen />} />
                <Route path="podcasts/:id" element={<PodcastEditorScreen />} />
                <Route path="telegram" element={<TelegramComposerScreen />} />
                <Route path="telegram/:type/:id" element={<TelegramComposerScreen />} />
              </Route>
            </Route>
          </Routes>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
