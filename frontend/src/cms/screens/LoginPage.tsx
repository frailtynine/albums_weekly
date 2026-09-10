import { Alert, Box, Button, Card, Container, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/cmsApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const hasToken = Boolean(localStorage.getItem('token'));

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || '/cms';
  }, [location.state]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      navigate(redirectTo, { replace: true });
    },
  });

  if (hasToken) {
    return <Navigate to="/cms" replace />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 12 } }}>
      <Card sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">Albums Weekly CMS</Typography>
        </Box>
        <Card sx={{ p: 0, background: 'transparent', border: 0, boxShadow: 'none' }}>
          <Typography variant="h5">Sign in</Typography>
          <Stack spacing={2.5}>
            {loginMutation.isError && <Alert severity="error">Invalid username or password</Alert>}
            <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth />
            <Button
              variant="contained"
              size="large"
              onClick={() => loginMutation.mutate({ username, password })}
              disabled={loginMutation.isPending || !username || !password}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Open CMS'}
            </Button>
          </Stack>
        </Card>
      </Card>
    </Container>
  );
}
