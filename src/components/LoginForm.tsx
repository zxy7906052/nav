import { useState } from "react";
import {
    Card,
    CardContent,
    Box,
    Avatar,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";

interface LoginFormProps {
    onLogin: (username: string, password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

/**
 * 登录表单组件
 */
const LoginForm = ({ onLogin, loading, error }: LoginFormProps) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <Card elevation={3} sx={{ maxWidth: 400, width: "100%", p: 2 }}>
            <CardContent>
                <Box sx={{ mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar sx={{ mb: 2, bgcolor: "primary.main" }}>
                        <LockIcon />
                    </Avatar>
                    <Typography variant='h5' component='h1' gutterBottom>
                        登录
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        请输入您的账号密码登录系统
                    </Typography>
                </Box>

                {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label='用户名'
                        variant='outlined'
                        margin='normal'
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <PersonIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label='密码'
                        variant='outlined'
                        margin='normal'
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <LockIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge='end'
                                    >
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        color='primary'
                        size='large'
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? "登录中..." : "登录"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
