// import React from "react";
// import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import * as styles from "./MainContent.styles";

const items = Array.from({ length: 5 });

export default function MainContent() {
  return (
    <Box component="main" sx={styles.main}>
      <Container sx={styles.container}>
        {/* 구글 시트 데이터 페이지로 이동하는 버튼 추가 */}
        {/* <Button
          component={RouterLink}
          to="/sheet"
          variant="contained"
          sx={{ mb: 4 }}
        >
          시트 데이터 보러가기
        </Button> */}
        <Typography variant="h5" sx={styles.heading}>
          Mobile List Cards
        </Typography>
        <Typography color="text.secondary" sx={styles.subheading}>
          Desktop view preserves the intended mobile layout.
        </Typography>

        <Box sx={styles.list}>
          {items.map((_, index) => (
            <Paper key={index} sx={styles.card}>
              <Typography sx={styles.cardTitle}>Item #{index + 1}</Typography>
              <Typography color="text.secondary" sx={styles.cardBody}>
                Location-aware content keeps the experience consistent.
              </Typography>
              <Button variant="contained" fullWidth>
                Action
              </Button>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
