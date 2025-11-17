import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import api from "../../api/axios.interceptor";

export default function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("low");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    api.get("/users/basic").then((res) => setUsers(res.data));
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/tasks", {
      title,
      description: desc,
      priority,
      assignedTo,
    });
    window.dispatchEvent(
      new CustomEvent("api-success", { detail: "Task created successfully" })
    );
    setOpen(false);
    setTitle("");
    setDesc("");
    setAssignedTo("");
    onCreated();
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        + Create Task
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <form onSubmit={createTask}>
            <Grid container spacing={2} mt={1}>
              <Grid size={12}>
                <TextField
                  label="Title"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
              </Grid>

              <Grid size={6}>
                <TextField
                  select
                  fullWidth
                  label="Assign To"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name || u.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12} textAlign="right">
                <Button variant="contained" type="submit">
                  Create
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
