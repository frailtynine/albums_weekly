import { Box, Button, Card, Checkbox, Divider, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '../lib/format';

interface EntityFormScaffoldProps {
  title: string;
  subtitle: string;
  showMeta?: boolean;
  dateLabel?: string;
  pubDate: string;
  isPublished: boolean;
  onPubDateChange: (value: string) => void;
  onPublishedChange: (value: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: ReactNode;
}

export default function EntityFormScaffold({
  title,
  subtitle,
  showMeta = true,
  dateLabel = 'Publication date',
  pubDate,
  isPublished,
  onPubDateChange,
  onPublishedChange,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  children,
}: EntityFormScaffoldProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      </Box>
      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          {showMeta && (
            <>
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between">
                <TextField
                  label={dateLabel}
                  type="datetime-local"
                  value={toDateTimeLocalValue(pubDate)}
                  onChange={(event) => onPubDateChange(fromDateTimeLocalValue(event.target.value))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { lg: 260 } }}
                />
                <FormControlLabel
                  control={<Checkbox checked={isPublished} onChange={(event) => onPublishedChange(event.target.checked)} />}
                  label="Published"
                />
              </Stack>
              <Divider />
            </>
          )}
          {children}
          <Divider />
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
            <Button variant="text" color="inherit" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSubmit}>
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
