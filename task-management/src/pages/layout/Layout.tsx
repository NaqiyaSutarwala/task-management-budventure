import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const drawerWidth = 260;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = React.useContext(AuthContext);
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  React.useEffect(() => {
    if (!isMobile) setOpen(true);
  }, [isMobile]);

  return (
    <Box
      sx={{ minHeight: "100vh", bgcolor: "transparent", position: "relative" }}
    >
      {/* background gradient and subtle blur */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(800px 400px at 10% 10%, rgba(124,92,255,0.10), transparent 15%), radial-gradient(600px 300px at 90% 90%, rgba(46,58,89,0.06), transparent 15%), linear-gradient(180deg, #f7f9ff 0%, #f0f6ff 60%)",
          zIndex: -2,
        }}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setOpen((v) => !v)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Aurora Tasks
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              {user?.name ?? user?.email}
            </Typography>
            <Avatar sx={{ bgcolor: "#7c5cff" }}>
              {user?.name?.[0] ?? user?.email?.[0]}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            marginTop: "64px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.4))",
            borderRight: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <List component="nav" sx={{ px: 1 }}>
          <ListItemButton onClick={() => navigate("/dashboard")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate("/dashboard?scope=byMe")}>
            <ListItemIcon>
              <AssignmentIndIcon />
            </ListItemIcon>
            <ListItemText primary="Assigned by me" />
          </ListItemButton>

          <ListItemButton
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: isMobile ? 0 : `${drawerWidth}px`,
          p: { xs: 2, md: 4 },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
