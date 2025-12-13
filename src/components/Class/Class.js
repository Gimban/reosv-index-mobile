import React, { useState, useEffect, useContext } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import * as styles from "./Class.styles";

export default function Class() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO: Implement data fetching from the correct sheet
  const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
  const GID = "1281476028";
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          클래스 목록을 불러오는 중입니다...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <Typography color="error">오류: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container sx={styles.container}>
      <Typography variant="h5" gutterBottom>
        클래스 목록
      </Typography>
      <Box>
        <Typography>Class page is under construction.</Typography>
      </Box>
    </Container>
  );
}
