
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { deleteModel } from '../../api';


interface DeleteDialogProps {
  text?: string;
  openDeleteDialog: (state: boolean) => void;
  endpoint: string;
  id: number;
  isOpen: boolean;
  handleRefresh?: () => void;
}

export default function DeleteDialog({text, openDeleteDialog, endpoint, id, isOpen, handleRefresh}: DeleteDialogProps) {
  const [open, setOpen] = React.useState(isOpen);

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    openDeleteDialog(false);
  };

  const handleDelete = async () => {
    const response = await deleteModel(endpoint, id);
    if (response) {
      openDeleteDialog(false);
      handleRefresh?.();
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete album?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
