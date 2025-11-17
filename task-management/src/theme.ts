import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2e3a59" },
    secondary: { main: "#7c5cff" },
    background: {
      default:
        "linear-gradient(180deg,#f5f7fb 0%, #eef2ff 100%)" as unknown as string,
      paper: "rgba(255,255,255,0.6)" as unknown as string,
    },
  },
  typography: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    h5: { fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(8px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.45))",
          boxShadow: "0 6px 30px rgba(32,41,58,0.12)",
          border: "1px solid rgba(255,255,255,0.6)",
        },
      },
    },
  },
});

export default theme;
