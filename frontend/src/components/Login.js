import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, Container, Box, Typography, Alert } from '@mui/material';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const { username, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/login', formData,{ withCredentials: true });
            setSuccess(true);            
            navigate('/home', { state: { data: res.data} });  // Redirect with schedule
            
        } catch (err) {
            setError(err.response?.data?.msg || 'Server error. Please try again.');
        }
    };


    return (
        <Container maxWidth="sm">
            <Box
                sx={{display: 'flex',flexDirection: 'column',alignItems: 'center',justifyContent: 'center',minHeight: '100vh',gap: 2,p: 4,boxShadow: 3,borderRadius: 2,}}
            >
                <Typography variant="h4" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={onSubmit} style={{ width: '100%' }}>
                    <TextField fullWidth label="Username" variant="outlined" name="username" value={username} onChange={onChange} margin="normal" required />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        name="password"
                        value={password}
                        onChange={onChange}
                        margin="normal"
                        required
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">Login successful!</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
