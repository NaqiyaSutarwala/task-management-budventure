import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import api from "../../api/axios.interceptor";
import type { ITask } from "../../types/tasks/task.types";
import TaskEditDialog from "./TaskEditDialog";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function TaskList({
  onChange,
  refreshKey = 0,
  scope = "toMe",
}: {
  onChange: () => void;
  refreshKey?: number;
  scope?: "toMe" | "byMe";
}) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", { params: { search, scope } });
      setTasks(res.data.tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, scope]);

  const update = async (id: string, status: string) => {
    await api.put(`/tasks/${id}`, { status });
    await load();
    onChange();
    window.dispatchEvent(
      new CustomEvent("api-success", { detail: "Task updated successfully" })
    );
  };

  const remove = async () => {
    if (!toDeleteId) return;
    await api.delete(`/tasks/${toDeleteId}`);
    await load();
    onChange();
    window.dispatchEvent(
      new CustomEvent("api-success", { detail: "Task deleted successfully" })
    );
    setDeleteOpen(false);
    setToDeleteId(null);
  };

  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search tasks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={load}>
          Search
        </Button>
      </Stack>

      <Table sx={{ bgcolor: "white" }}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Assigned</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {!loading && tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No results found
              </TableCell>
            </TableRow>
          )}

          {tasks.map((t) => (
            <TableRow key={t._id}>
              <TableCell>{t.title}</TableCell>

              <TableCell>
                <Chip
                  label={t.priority}
                  color={
                    t.priority === "high"
                      ? "error"
                      : t.priority === "medium"
                      ? "warning"
                      : "info"
                  }
                />
              </TableCell>

              <TableCell>
                <TextField
                  select
                  size="small"
                  value={t.status}
                  onChange={(e) => update(t._id, e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In-progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </TableCell>

              <TableCell>{t.assignedTo?.name || "—"}</TableCell>

              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedTask(t);
                      setEditOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setToDeleteId(t._id);
                      setDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TaskEditDialog
        open={editOpen}
        task={selectedTask}
        onClose={() => setEditOpen(false)}
        onUpdated={async () => {
          await load();
          onChange();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete task?"
        message="This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onClose={() => {
          setDeleteOpen(false);
          setToDeleteId(null);
        }}
        onConfirm={remove}
      />
    </>
  );
}
