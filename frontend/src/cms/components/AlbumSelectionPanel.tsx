import { AlbumResponse } from '../../interface';
import { Box, Button, Card, Chip, Stack, Typography } from '@mui/material';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { resolveImageUrl } from '../api/cmsApi';

interface AlbumSelectionPanelProps {
  availableAlbums: AlbumResponse[];
  selectedAlbums: AlbumResponse[];
  onAddAlbum: (albumId: number) => void;
  onRemoveAlbum: (albumId: number) => void;
  onReorder: (albumIds: number[]) => void;
}

function SortableSelectedAlbumCard({ album, onRemove }: { album: AlbumResponse; onRemove: (albumId: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: album.id });

  return (
    <Card
      ref={setNodeRef}
      sx={{
        p: 1.5,
        display: 'grid',
        gridTemplateColumns: 'auto 64px 1fr auto',
        gap: 1.5,
        alignItems: 'center',
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Button {...attributes} {...listeners} sx={{ minWidth: 0, p: 0.5 }} aria-label={`Reorder ${album.band_name}`}>
        <DragIndicatorRoundedIcon />
      </Button>
      <Box
        component="img"
        src={resolveImageUrl(album.image_url)}
        alt={album.album_name}
        sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 2 }}
      />
      <Box>
        <Typography variant="subtitle1">{album.band_name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {album.album_name}
        </Typography>
      </Box>
      <Button color="error" sx={{ minWidth: 0 }} onClick={() => onRemove(album.id)} aria-label={`Remove ${album.band_name}`}>
        <DeleteOutlineRoundedIcon />
      </Button>
    </Card>
  );
}

export default function AlbumSelectionPanel({
  availableAlbums,
  selectedAlbums,
  onAddAlbum,
  onRemoveAlbum,
  onReorder,
}: AlbumSelectionPanelProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentIds = selectedAlbums.map((album) => album.id);
    const oldIndex = currentIds.indexOf(Number(active.id));
    const newIndex = currentIds.indexOf(Number(over.id));
    onReorder(arrayMove(currentIds, oldIndex, newIndex));
  };

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 2.5 }}>
        <Typography variant="h6">Add unpublished albums</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Click to add them into the post queue.
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {availableAlbums.length ? (
            availableAlbums.map((album) => (
              <Chip
                key={album.id}
                clickable
                label={`${album.band_name} - ${album.album_name}`}
                onClick={() => onAddAlbum(album.id)}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No unpublished albums available.
            </Typography>
          )}
        </Stack>
      </Card>
      <Card sx={{ p: 2.5 }}>
        <Typography variant="h6">Selected albums</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Drag cards to define the publishing order.
        </Typography>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selectedAlbums.map((album) => album.id)} strategy={rectSortingStrategy}>
            <Stack spacing={1.5}>
              {selectedAlbums.map((album) => (
                <SortableSelectedAlbumCard key={album.id} album={album} onRemove={onRemoveAlbum} />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      </Card>
    </Stack>
  );
}
