import { useState } from "react";
import { AlbumResponse } from "../../interface";
import { Box, Chip, List, ListItem, Popover } from "@mui/material";
import AlbumCard from "./AlbumCard";


interface AlbumChipsProps {
  onClick?: (albumId: number) => void;
  albums: AlbumResponse[];
}

export default function AlbumChips ({onClick, albums}: AlbumChipsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlbumId(id);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedAlbumId(null);
  };
  

  const open = Boolean(anchorEl);
  

  return (
      <Box sx={{width: '20vh'}}>
        <List>
          {albums.map(album => (
              <ListItem key={album.id}>
              <Chip
                label={`${album.band_name} - ${album.album_name}`}
                clickable
                onMouseEnter={(event) => handlePopoverOpen(event, album.id)}
                onMouseLeave={handlePopoverClose}
                onClick={() => {
                  onClick?.(album.id);
                  handlePopoverClose();
                }}
              />
              </ListItem>
          ))}
        </List>
        <Popover
          sx={{
            pointerEvents: 'none',
            scale: '70%'
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
        {selectedAlbumId && (
          <AlbumCard id={selectedAlbumId} hideButtons={true}/>
        )}
      </Popover>

      </Box>
  );
}