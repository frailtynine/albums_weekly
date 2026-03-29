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

const BG = "#524468";
const CARD = 1000;
const PAD = 54;
const ART = 340;

function formatDate(dateStr: string): [string, string] {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return [`${dd}.${mm}.`, String(d.getFullYear())];
}

export default function ShareImage({ albums }: ShareImageProps) {
  const imageRefs = useRef<HTMLDivElement[]>([]);
  const { setCurrentComponent } = useComponent();

  const stripHtmlTags = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    for (let i = 0; i < albums.length; i++) {
      const element = imageRefs.current[i];
      if (element) {
        try {
          const dataUrl = await toPng(element, { pixelRatio: 1 });
          zip.file(`album-${i}.png`, dataUrl.split("base64,")[1], { base64: true });
        } catch (error) {
          console.error(error);
        }
      }
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "generated_images.zip");
    });
  };

  return (
    <div>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={handleDownload}>Download images</Button>
        <Button variant="contained" onClick={() => setCurrentComponent(<MainTable />)}>Cancel</Button>
      </Box>

      {albums.map((album: AlbumResponse, index) => {
        const [dateLine1, dateLine2] = formatDate(album.pub_date);
        return (
          <div
            style={{ margin: "10px", display: "inline-block" }}
            id={`album-${album.id}`}
            key={`album-${album.id}`}
            ref={(el) => { if (el) imageRefs.current[index] = el; }}
          >
            <div
              style={{
                position: "relative",
                width: `${CARD}px`,
                height: `${CARD}px`,
                backgroundColor: BG,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: "#fff",
                overflow: "hidden",
                padding: `${PAD}px`,
                boxSizing: "border-box",
                textAlign: "left",
              }}
            >
              {/* Album art — absolute top-right */}
              <img
                src={`${BASE_URL}${album.image_url}`}
                alt=""
                style={{
                  position: "absolute",
                  top: `${PAD}px`,
                  right: `${PAD}px`,
                  width: `${ART}px`,
                  height: `${ART}px`,
                  objectFit: "cover",
                  borderRadius: "16px",
                }}
              />

              {/* Top section: header + title, constrained left of art, min-height matches art so review always starts below */}
              <div style={{ marginRight: `${ART + 20}px`, minHeight: `${ART}px`, display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                {/* Date + app name row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "22px" }}>
                  {/* Date — two lines, bold */}
                  <div style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", flexShrink: 0 }}>
                    <div>{dateLine1}</div>
                    <div>{dateLine2}</div>
                  </div>
                  {/* App name — two lines, second line indented */}
                  <div style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.01em" }}>
                    <div>АЛЬБОМЫ</div>
                    <div style={{ paddingLeft: "24px" }}>ПО ПЯТНИЦАМ</div>
                  </div>
                </div>

                {/* Title */}
                <div
                  style={{
                    marginTop: "36px",
                    fontSize: "54px",
                    fontWeight: 900,
                    lineHeight: 1.0,
                    letterSpacing: "-0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  {album.band_name} — {album.album_name}
                </div>
              </div>

              {/* Review text — always starts below art */}
              <div
                style={{
                  marginTop: "36px",
                  paddingLeft: "50px",
                  fontSize: "26px",
                  fontWeight: 400,
                  lineHeight: 1.55,
                  letterSpacing: "0.005em",
                  overflow: "hidden",
                  maxHeight: "360px",
                }}
              >
                {stripHtmlTags(album.text)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}