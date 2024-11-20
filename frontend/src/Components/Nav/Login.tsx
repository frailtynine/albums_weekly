import { useState, useEffect } from "react";
import { TextField, Button, Typography, Container, Alert, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchLogin, verifyToken } from "../../api";
import { LoginRequest } from "../../interface";

export default function Login() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
         verifyToken()
         .then(responseCode => {
            if (responseCode == 200) {
                navigate('/cms')
            }
         })
    }, [])

    const handleLogin = async () => {
        try {
            const loginData: LoginRequest = {
                password: password,
                username: username
            }
            const responseData = await fetchLogin(loginData);
            
            localStorage.setItem('token', responseData.access);
            localStorage.setItem('refreshToken', responseData.refresh);
            navigate('/cms');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: 8,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleLogin}
                >
                    Login
                </Button>
            </Box>
        </Container>
    );
}