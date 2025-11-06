import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import * as styles from "./Header.styles";

export default function Header() {
  return (
    <AppBar position="sticky" sx={styles.appBar}>
      <Toolbar sx={styles.toolbar}>
        <Typography variant="h6" sx={styles.title}>
          My Mobile App
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
