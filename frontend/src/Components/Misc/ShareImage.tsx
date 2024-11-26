import { useRef } from "react";
import { Button, Box } from "@mui/material";
import { AlbumResponse } from "../../interface";
import JSZip from "jszip";
import { toPng } from "html-to-image";
import saveAs from "file-saver";
import { BASE_URL } from "../../api";
import { useComponent } from "./Context";
import MainTable from "./MainTable";

interface ShareImageProps {
  albums: AlbumResponse[];
}

export default function ShareImage({albums}: ShareImageProps) {
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const { setCurrentComponent } = useComponent();

  const handleDownload = async () => {
    const zip = new JSZip();
    for (let i = 0; i < albums.length; i++) {
      const element = imageRefs.current[i];
      if (element) {
        try {
          const dataUrl = await toPng(element);
          zip.file(`album-${i}.png`, dataUrl.split('base64,')[1], { base64: true });
        }
        catch (error) {
          console.error(error);
        }
      }
    }

    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, 'generated_images.zip');
      });
  };

  return (
    <div>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" onClick={handleDownload}>Download images</Button>
        <Button variant="contained" onClick={() => setCurrentComponent(<MainTable/>)}>Cancel</Button>
      </Box>
    {albums.map((album: AlbumResponse, index) => (
      <div
        style={{ margin: '10px' }}
        id={`album-${album.id}`}
        key={`album-${album.id}`}
        ref={(el) => {
          if (el) {
        imageRefs.current[index] = el;
          }
        }}
      >
        <div
          style={{
            margin: 0,
            padding: 0,
            backgroundImage: `url(${BASE_URL}${album.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontFamily: "'Helvetica Neue', sans-serif",
            color: 'white',
            width: '1000px',
            height: '1000px',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          ></div>
          <div
            style={{
              position: 'relative',
              width: '1000px',
              height: '1000px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'left',
              textAlign: 'left',
              overflow: 'auto',
            }}
          >
            <div
              style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '20px',
          paddingLeft: '50px',
          paddingRight: '50px',
              }}
            >
              {album.band_name} — {album.album_name}
            </div>
            <div
              style={{
                fontSize: '28px',
                maxWidth: '90%',
                textAlign: 'left',
                lineHeight: 1.4,
                paddingLeft: '50px',
                paddingRight: '50px',
                paddingBottom: '20px',
                    }}
            >
              {album.text}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
}