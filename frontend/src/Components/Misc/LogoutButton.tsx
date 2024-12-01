import { Button } from "@mui/material";

export default function LogoutButton() {
  return (
    <Button
      variant="contained"
      onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.reload();
      }}
    >
      Logout
    </Button>
  )
}