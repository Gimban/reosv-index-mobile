import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import * as styles from "./Guild.styles";

const Guild = () => {
  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        길드
      </Typography>
      <Paper sx={styles.paper}>
        <Typography>길드 스탯 설정 페이지입니다.</Typography>
      </Paper>
    </Box>
  );
};

export default Guild;
