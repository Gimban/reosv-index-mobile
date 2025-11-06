import React from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import * as styles from "./MainContent.styles";

const items = Array.from({ length: 5 });

export default function MainContent() {
  return (
    <Box component="main" sx={styles.main}>
      <Container sx={styles.container}>
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
