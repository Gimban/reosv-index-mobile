import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as styles from "./Accessory.styles";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";

const Accessory = () => {
  const navigate = useNavigate();
  // 추후 장신구 상태 관리를 위해 사용
  // eslint-disable-next-line no-unused-vars
  const { dpsState, updateDpsState } = useDpsCalc();

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        장신구 설정
      </Typography>
      <Typography sx={{ mb: 2 }}>장신구 선택 및 설정 화면입니다.</Typography>
      <Button variant="outlined" onClick={() => navigate("/dps_calc")}>
        뒤로 가기
      </Button>
    </Box>
  );
};

export default Accessory;
