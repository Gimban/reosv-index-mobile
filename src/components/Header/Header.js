import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import * as styles from "./Header.styles";

export default function Header({ onMenuClick }) {
  return (
    <AppBar position="sticky" sx={styles.appBar}>
      <Toolbar sx={styles.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={styles.title}>
          Reo Index
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
