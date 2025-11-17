import React, { useState, useContext } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      nav("/dashboard");
    } catch (error: any) {
      setErr(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: 10, p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Create Account
          </Typography>

          {err && <Alert severity="error">{err}</Alert>}

          <Stack spacing={2} mt={2}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              Register
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
