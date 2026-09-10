import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, Stack, Typography } from '@mui/material';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { toPng } from 'html-to-image';
import { Vibrant } from 'node-vibrant/browser';
import { createRef, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlbumResponse } from '../../interface';
import { fetchPost, resolveImageUrl } from '../api/cmsApi';
import { formatShareImageDate } from '../lib/format';

const fallbackBackground = '#524468';
const cardSize = 1000;
const artworkSize = 600;
const cardPadding = 54;

function swatchToBackground(swatch: { hsl: [number, number, number] }) {
  const [h, s, l] = swatch.hsl;
  const saturation = Math.round(Math.min(Math.max(s * 100, 35), 65));
  const lightness = Math.round(Math.min(Math.max(l * 100, 24), 30));
  return `hsl(${Math.round(h * 360)} ${saturation}% ${lightness}%)`;
}

async function extractDominantColor(src: string) {
  try {
    const palette = await Vibrant.from(src).getPalette();
    const swatch =
      palette.Muted ??
      palette.Vibrant ??
      palette.DarkVibrant ??
      palette.DarkMuted ??
      palette.LightVibrant ??
      palette.LightMuted;

    return swatch ? swatchToBackground(swatch) : fallbackBackground;
  } catch {
    return fallbackBackground;
  }
}

function ShareImageCard({ album, background, innerRef }: { album: AlbumResponse; background: string; innerRef: React.RefObject<HTMLDivElement | null> }) {
  const [dateLine1, dateLine2] = formatShareImageDate(album.pub_date);

  return (
    <Card sx={{ p: 2, overflow: 'auto' }}>
      <Box
        ref={innerRef}
        sx={{
          width: cardSize,
          height: cardSize,
          backgroundColor: background,
          color: '#fff',
          p: `${cardPadding}px`,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '22px' }}>
          <Box sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, flexShrink: 0 }}>
            <div>{dateLine1}</div>
            <div>{dateLine2}</div>
          </Box>
          <Box sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
            <div>АЛЬБОМЫ</div>
            <div style={{ paddingLeft: '24px' }}>ПО ПЯТНИЦАМ</div>
          </Box>
        </Box>
        <Box sx={{ mt: '36px', fontSize: 54, fontWeight: 900, lineHeight: 1, textTransform: 'uppercase' }}>
          {album.band_name} - {album.album_name}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '48px' }}>
          <Box
            component="img"
            src={resolveImageUrl(album.image_url)}
            alt={album.album_name}
            sx={{ width: artworkSize, height: artworkSize, objectFit: 'cover', borderRadius: 4, display: 'block' }}
          />
        </Box>
      </Box>
    </Card>
  );
}

export default function ShareImagesScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const postId = params.id ? Number(params.id) : null;
  const [downloadError, setDownloadError] = useState('');

  const postQuery = useQuery({
    queryKey: ['post-share-images', postId],
    queryFn: () => fetchPost(postId as number),
    enabled: Boolean(postId),
  });

  const albums = postQuery.data?.albums || [];
  const refs = useMemo(() => albums.map(() => createRef<HTMLDivElement>()), [albums]);
  const [backgrounds, setBackgrounds] = useState<Record<number, string>>({});

  useEffect(() => {
    albums.forEach((album) => {
      if (!backgrounds[album.id]) {
        void extractDominantColor(resolveImageUrl(album.image_url)).then((color) => {
          setBackgrounds((current) => ({ ...current, [album.id]: color }));
        });
      }
    });
  }, [albums, backgrounds]);

  const handleDownload = async () => {
    try {
      setDownloadError('');
      const zip = new JSZip();

      for (let index = 0; index < albums.length; index += 1) {
        const element = refs[index]?.current;
        const album = albums[index];
        if (!element || !album) {
          continue;
        }

        const dataUrl = await toPng(element, {
          pixelRatio: 1,
          cacheBust: true,
          canvasWidth: cardSize,
          canvasHeight: cardSize,
          backgroundColor: backgrounds[album.id] || fallbackBackground,
        });

        zip.file(`album-${index + 1}.png`, dataUrl.split('base64,')[1], { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'generated_images.zip');
    } catch {
      setDownloadError('Failed to generate images.');
    }
  };

  if (postQuery.isError) {
    return <Alert severity="error">Failed to load post albums.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Share image studio</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Generate post image sets from the album sequence and download them as a ZIP archive.
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" onClick={() => void handleDownload()} disabled={!albums.length}>
          Download images
        </Button>
        <Button variant="text" color="inherit" onClick={() => navigate('/cms')}>
          Back to dashboard
        </Button>
      </Stack>
      {downloadError && <Alert severity="error">{downloadError}</Alert>}
      <Stack spacing={2}>
        {albums.map((album, index) => (
          <ShareImageCard
            key={album.id}
            album={album}
            background={backgrounds[album.id] || fallbackBackground}
            innerRef={refs[index]}
          />
        ))}
      </Stack>
    </Stack>
  );
}
