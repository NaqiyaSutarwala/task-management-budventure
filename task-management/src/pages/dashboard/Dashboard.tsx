import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSearchParams } from "react-router-dom";

import TaskList from "../tasks/TaskList";
import Layout from "../layout/Layout";
import TaskForm from "../tasks/TaskForms";
import api from "../../api/axios.interceptor";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchParams] = useSearchParams();
  const scope = (searchParams.get("scope") as "toMe" | "byMe") || "toMe";

  const loadStats = async () => {
    const res = await api.get("/tasks/stats");
    setStats(res.data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Layout>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {[
          { label: "Total Tasks", value: stats.total, color: "#1976d2" },
          { label: "Completed", value: stats.completed, color: "#2e7d32" },
          { label: "Pending", value: stats.pending, color: "#d32f2f" },
        ].map((stat) => (
          <Grid key={stat.label} size={{ sm: 4 }}>
            <Card sx={{ background: stat.color, color: "white" }}>
              <CardContent>
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Task Form & List */}
        <Grid size={12}>
          <TaskForm
            onCreated={() => {
              loadStats();
              setRefreshKey((k) => k + 1);
            }}
          />
        </Grid>

        <Grid size={12}>
          <TaskList onChange={loadStats} refreshKey={refreshKey} scope={scope} />
        </Grid>
      </Grid>
    </Layout>
  );
}
