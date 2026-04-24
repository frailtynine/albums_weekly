import React, { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { AlbumResponse, AlbumRequest } from "../../interface";
import { BASE_URL, fetchSonglinkData, postAlbum, updateAlbum, fetchModel } from "../../api";
import Button from "@mui/material/Button";
import MainTable from "../Misc/MainTable";
import { Checkbox, Typography } from "@mui/material";
import { useComponent } from "../Misc/Context";
import CustomDateTimePicker from "../Misc/CustomDateTimePicker";
import dayjs from "dayjs";
import TipTapEditor from "../Misc/EditorView";

const MUSIC_PLATFORM_FIELDS = [
  { key: "spotify", label: "Spotify URL" },
  { key: "tidal", label: "Tidal URL" },
  { key: "appleMusic", label: "Apple Music URL" },
  { key: "deezer", label: "Deezer URL" },
] as const;

type MusicPlatformKey = typeof MUSIC_PLATFORM_FIELDS[number]["key"];

interface AlbumCreateFormProps {
  elementId?: number | null;
}

export default function AlbumCreateForm({ elementId }: AlbumCreateFormProps) {
  const { setCurrentComponent } = useComponent();
  const [albumData, setAlbumData] = useState<AlbumRequest>({
    album_name: "",
    text: "",
    band_name: "",
    spotify_url: "",
    url: "",
    image_url: "",
    links: {},
    is_published: false,
    pub_date: "",
  });
  const [autofillUrl, setAutofillUrl] = useState("");
  const [songlinkError, setSonglinkError] = useState("");
  const wasPublishedRef = useRef(false);

  const persistField = useCallback(
    (field: keyof AlbumRequest, value: string) => {
      if (!elementId) {
        localStorage.setItem(`album${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
      }
    },
    [elementId]
  );

  const fetchAlbum = useCallback(async () => {
    if (elementId) {
      try {
        const albumToUpdate: AlbumResponse = await fetchModel("albums", elementId);
        const { id, ...filteredAlbumData } = albumToUpdate;
        void id;
        setAlbumData({
          ...filteredAlbumData,
          spotify_url: filteredAlbumData.spotify_url || filteredAlbumData.links?.spotify?.url || "",
        });
        setAutofillUrl(filteredAlbumData.spotify_url || filteredAlbumData.url || "");
        wasPublishedRef.current = filteredAlbumData.is_published;
      } catch (err) {
        console.error("Error fetching album:", err);
      }
    } else {
      setAlbumData((prevData) => ({
        ...prevData,
        text: localStorage.getItem("albumText") || "",
      }));
      setAutofillUrl("");
      wasPublishedRef.current = false;
    }
  }, [elementId]);

  useEffect(() => {
    void fetchAlbum();
  }, [fetchAlbum]);

  const handleSonglinkData = async (url: string) => {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      setSonglinkError("Enter a link to auto-fill album data.");
      return;
    }

    try {
      setSonglinkError("");
      const response = await fetchSonglinkData(normalizedUrl);
      setAlbumData((prevData) => ({
        ...prevData,
        ...response,
        spotify_url: response.links?.spotify?.url || prevData.spotify_url || normalizedUrl,
      }));
      setAutofillUrl(normalizedUrl);
    } catch {
      setSonglinkError("Something wrong, try again");
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text");
    await handleSonglinkData(pastedText);
  };

  const handleSubmit = async () => {
    if (elementId) {
      try {
        const payload = {
          ...albumData,
          pub_date: !wasPublishedRef.current && albumData.is_published
            ? new Date().toISOString()
            : albumData.pub_date,
        };
        await updateAlbum(elementId, payload);
        setCurrentComponent(<MainTable />);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await postAlbum({
          ...albumData,
          pub_date: new Date().toISOString(),
        });
        localStorage.removeItem("albumText");
        setCurrentComponent(<MainTable />);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleFieldChange = (field: keyof AlbumRequest, value: string) => {
    setAlbumData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    persistField(field, value);
  };

  const getMusicLinkValue = (platform: MusicPlatformKey) => {
    if (platform === "spotify") {
      return albumData.spotify_url || albumData.links?.spotify?.url || "";
    }

    return albumData.links?.[platform]?.url || "";
  };

  const handleMusicLinkChange = (platform: MusicPlatformKey, value: string) => {
    setAlbumData((prevData) => {
      const nextLinks = { ...prevData.links };

      if (value.trim()) {
        nextLinks[platform] = {
          ...(nextLinks[platform] || {}),
          url: value,
        };
      } else {
        delete nextLinks[platform];
      }

      return {
        ...prevData,
        links: nextLinks,
        ...(platform === "spotify" ? { spotify_url: value } : {}),
      };
    });

    if (platform === "spotify") {
      persistField("spotify_url", value);
    }
  };

  const resolvedImageUrl = albumData.image_url
    ? /^(https?:\/\/|data:)/.test(albumData.image_url)
      ? albumData.image_url
      : `${BASE_URL}${albumData.image_url}`
    : "";

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{ padding: 2, width: 800, margin: "0 auto", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ mb: 1, display: "flex", justifyContent: "flex-end" }}>
        <CustomDateTimePicker
          label="Publication date"
          value={albumData.pub_date ? dayjs(albumData.pub_date) : null}
          onChange={(newValue) => {
            setAlbumData((prevData) => ({
              ...prevData,
              pub_date: newValue ? newValue.toISOString() : "",
            }));
          }}
        />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", mb: 1 }}>
        <TextField
          sx={{ paddingRight: 1 }}
          id="outlined-basic"
          fullWidth
          label="Band name"
          variant="outlined"
          onChange={(e) =>
            setAlbumData((prevData) => ({
              ...prevData,
              band_name: e.target.value,
            }))
          }
          value={albumData.band_name || ""}
        />
        <TextField
          sx={{ paddingLeft: 1 }}
          id="outlined-basic"
          fullWidth
          label="Album name"
          variant="outlined"
          onChange={(e) =>
            setAlbumData((prevData) => ({
              ...prevData,
              album_name: e.target.value,
            }))
          }
          value={albumData.album_name || ""}
        />
      </Box>
      <Box sx={{ mb: 1 }}>
        <TipTapEditor
          textValue={albumData.text}
          setTextValue={(newText) => handleFieldChange("text", newText)}
        />
      </Box>
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          label="Autofill URL"
          variant="outlined"
          value={autofillUrl}
          onPaste={handlePaste}
          onChange={(e) => {
            setAutofillUrl(e.target.value);
            if (songlinkError) {
              setSonglinkError("");
            }
          }}
          helperText={songlinkError || "Paste or enter a link here to auto-fill album data."}
        />
        <Button
          variant="outlined"
          onClick={() => void handleSonglinkData(autofillUrl)}
          disabled={!autofillUrl.trim()}
        >
          Autofill
        </Button>
      </Box>
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="subtitle1">Streaming links</Typography>
        {MUSIC_PLATFORM_FIELDS.map(({ key, label }) => (
          <Box key={key} sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              label={label}
              variant="outlined"
              value={getMusicLinkValue(key)}
              onChange={(e) => handleMusicLinkChange(key, e.target.value)}
            />
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => handleMusicLinkChange(key, "")}
              disabled={!getMusicLinkValue(key)}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="subtitle1">Cover image</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            label="Image URL"
            variant="outlined"
            value={albumData.image_url}
            onChange={(e) => handleFieldChange("image_url", e.target.value)}
          />
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => handleFieldChange("image_url", "")}
            disabled={!albumData.image_url}
          >
            Remove
          </Button>
        </Box>
        {resolvedImageUrl && (
          <Box
            component="img"
            src={resolvedImageUrl}
            alt="Album cover preview"
            sx={{
              width: 180,
              height: 180,
              objectFit: "cover",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        )}
      </Box>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={albumData.is_published}
            onChange={(e) => setAlbumData((prev) => ({ ...prev, is_published: e.target.checked }))}
            aria-label="Publish"
          />
          <Typography variant="h6">Publish</Typography>
        </Box>
        <Button sx={{ margin: 1 }} variant="contained" onClick={() => handleSubmit()}>
          Submit
        </Button>
        <Button
          sx={{ margin: 1 }}
          variant="contained"
          onClick={() => setCurrentComponent(<MainTable />)}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
