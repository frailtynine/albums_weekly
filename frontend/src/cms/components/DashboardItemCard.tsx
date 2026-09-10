import { Box, Button, Card, Chip, Stack, Tooltip, Typography } from '@mui/material';
import AlbumRoundedIcon from '@mui/icons-material/AlbumRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PodcastsRoundedIcon from '@mui/icons-material/PodcastsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { ReactNode } from 'react';
import { EntityType } from '../api/cmsApi';
import { formatDisplayDate } from '../lib/format';

export interface DashboardCardItem {
  id: number;
  type: EntityType;
  title: string;
  date: string;
  isPublished: boolean;
  views?: number;
  substackContent?: string;
}

interface DashboardItemCardProps {
  item: DashboardCardItem;
  onEdit: () => void;
  onDelete: () => void;
  onTelegram?: () => void;
  onShareImages?: () => void;
  onSubstack?: () => void;
}

const iconMap: Record<EntityType, ReactNode> = {
  albums: <AlbumRoundedIcon />,
  posts: <NewspaperRoundedIcon />,
  texts: <NotesRoundedIcon />,
  podcasts: <PodcastsRoundedIcon />,
};

function PublishStatusIcon({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <Tooltip title="Published">
        <CheckCircleRoundedIcon color="primary" fontSize="small" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Draft">
      <ScheduleRoundedIcon color="disabled" fontSize="small" />
    </Tooltip>
  );
}

export default function DashboardItemCard({
  item,
  onEdit,
  onDelete,
  onTelegram,
  onShareImages,
  onSubstack,
}: DashboardItemCardProps) {
  return (
    <Card sx={{ p: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          {iconMap[item.type]}
          <PublishStatusIcon isPublished={item.isPublished} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              <Box
                component="button"
                type="button"
                onClick={onEdit}
                sx={{
                  appearance: 'none',
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  p: 0,
                  m: 0,
                  font: 'inherit',
                  fontWeight: 'inherit',
                  lineHeight: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {item.title}
              </Box>
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={formatDisplayDate(item.date)} />
              {typeof item.views === 'number' && <Chip size="small" label={`${item.views} views`} />}
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" alignItems="center">
          <Button size="small" startIcon={<EditRoundedIcon />} onClick={onEdit}>
          Edit
        </Button>
        {onTelegram && (
          <Button size="small" startIcon={<TelegramIcon />} onClick={onTelegram}>
            Telegram
          </Button>
        )}
        {onShareImages && (
          <Button size="small" startIcon={<ImageRoundedIcon />} onClick={onShareImages}>
            Images
          </Button>
        )}
        {onSubstack && (
          <Button size="small" startIcon={<LaunchRoundedIcon />} onClick={onSubstack}>
            Substack
          </Button>
        )}
        <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete}>
          Delete
        </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
