import React, { useState } from "react";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as styles from "./ClassWeapon.styles";

const CLASSES = ["블레이드", "워리어", "메이지", "프로스트"];

const ClassWeapon = () => {
  const navigate = useNavigate();
  const [className, setClassName] = useState("");
  const [weaponName, setWeaponName] = useState("");
  const [weaponAtk, setWeaponAtk] = useState("");

  const handleSave = () => {
    // TODO: Context에 데이터 저장 로직 추가
    console.log({ className, weaponName, weaponAtk });
    navigate("/dps_calc");
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        클래스 및 무기 설정
      </Typography>
      <Box component="form" sx={styles.form}>
        <TextField
          select
          label="클래스 선택"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          fullWidth
        >
          {CLASSES.map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="무기 이름"
          value={weaponName}
          onChange={(e) => setWeaponName(e.target.value)}
          fullWidth
        />
        <TextField
          label="무기 공격력"
          type="number"
          value={weaponAtk}
          onChange={(e) => setWeaponAtk(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSave}
          fullWidth
          sx={styles.button}
        >
          저장
        </Button>
      </Box>
    </Box>
  );
};

export default ClassWeapon;
