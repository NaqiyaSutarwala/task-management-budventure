import React, { useState, useContext } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (error: any) {
      setErr(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: 10, p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Login
          </Typography>

          {err && <Alert severity="error">{err}</Alert>}

          <Stack spacing={2} mt={2}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="contained" onClick={submit} fullWidth>
              Login
            </Button>

            <Typography textAlign="center">
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
