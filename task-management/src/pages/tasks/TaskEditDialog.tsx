import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import api from "../../api/axios.interceptor";
import type { ITask } from "../../types/tasks/task.types";

interface TaskEditDialogProps {
  open: boolean;
  task: ITask | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function TaskEditDialog({
  open,
  task,
  onClose,
  onUpdated,
}: TaskEditDialogProps): React.ReactElement | null {
  const [users, setUsers] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("low");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    api.get("/users/basic").then((res) => setUsers(res.data));
  }, []);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title || "");
    setDesc(task.description || "");
    setPriority(task.priority || "low");
    setAssignedTo(task.assignedTo?._id || "");
  }, [task]);

  if (!task) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put(`/tasks/${task._id}`, {
      title,
      description: desc,
      priority,
      assignedTo,
    });
    window.dispatchEvent(
      new CustomEvent("api-success", { detail: "Task updated successfully" })
    );
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <form onSubmit={save}>
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

            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" type="submit">
                  Save
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}


