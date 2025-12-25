import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Alert,
} from "@mui/material";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import * as styles from "./Level.styles";

const Level = () => {
  const { dpsState, updateDpsState } = useDpsCalc();

  // 전역 상태에서 초기값 로드, 없으면 기본값 사용
  const [level, setLevel] = useState(dpsState.level || 1);
  const [moveSpeed, setMoveSpeed] = useState(dpsState.moveSpeed || 0);
  const [statType, setStatType] = useState(dpsState.statType || "attack"); // 'attack', 'health', 'custom'
  const [customAttack, setCustomAttack] = useState(dpsState.customAttack || 0);
  const [customHealth, setCustomHealth] = useState(dpsState.customHealth || 0);

  // 상태 변경 시 전역 상태 업데이트
  useEffect(() => {
    updateDpsState("level", level);
    updateDpsState("moveSpeed", moveSpeed);
    updateDpsState("statType", statType);
    updateDpsState("customAttack", customAttack);
    updateDpsState("customHealth", customHealth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, moveSpeed, statType, customAttack, customHealth]);

  // 사용 가능한 총 포인트 (레벨 - 1)
  const totalPoints = Math.max(0, level - 1);

  // 현재 사용된 포인트 계산
  const usedPoints = useMemo(() => {
    const ms = parseInt(moveSpeed, 10) || 0;
    if (statType === "custom") {
      const atk = parseInt(customAttack, 10) || 0;
      const hp = parseInt(customHealth, 10) || 0;
      return ms + atk + hp;
    }
    // All 공격력/체력인 경우 이동속도만 사용된 것으로 간주하고 나머지는 자동 할당
    return ms;
  }, [moveSpeed, statType, customAttack, customHealth]);

  // 포인트 초과 여부 검사
  const isOverLimit = useMemo(() => {
    if (statType === "custom") {
      return usedPoints > totalPoints;
    }
    // 자동 분배 모드에서는 이동속도가 전체 포인트를 넘는지 확인
    return (parseInt(moveSpeed, 10) || 0) > totalPoints;
  }, [usedPoints, totalPoints, statType, moveSpeed]);

  // 최종 대미지 추가 수치 계산
  const finalDamageBonus = useMemo(() => {
    const ms = parseInt(moveSpeed, 10) || 0;
    let bonus = 0;

    if (isOverLimit) return 0;

    if (statType === "attack") {
      const remaining = Math.max(0, totalPoints - ms);
      bonus = remaining * 0.65;
    } else if (statType === "health") {
      const remaining = Math.max(0, totalPoints - ms);
      bonus = remaining * 0.4;
    } else if (statType === "custom") {
      const atk = parseInt(customAttack, 10) || 0;
      const hp = parseInt(customHealth, 10) || 0;
      bonus = atk * 0.65 + hp * 0.4;
    }
    return bonus;
  }, [
    totalPoints,
    moveSpeed,
    statType,
    customAttack,
    customHealth,
    isOverLimit,
  ]);

  // 마나 관련 계산 (5레벨당 증가)
  const maxMana = 100 + Math.floor(level / 5) * 5;
  const manaRegen = 4 + Math.floor(level / 5) * 0.05;

  // 핸들러
  const handleLevelChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) setLevel("");
    else setLevel(Math.min(100, Math.max(1, val)));
  };

  const handleMoveSpeedChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) setMoveSpeed("");
    else setMoveSpeed(Math.min(10, Math.max(0, val)));
  };

  const handleCustomStatChange = (setter) => (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) setter("");
    else setter(Math.max(0, val));
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        레벨 & 스탯 설정
      </Typography>

      <Paper sx={styles.section}>
        <Box sx={styles.inputGroup}>
          <TextField
            label="플레이어 레벨"
            type="number"
            value={level}
            onChange={handleLevelChange}
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            helperText="1 ~ 100"
          />
          <TextField
            label="이동속도 투자 포인트"
            type="number"
            value={moveSpeed}
            onChange={handleMoveSpeedChange}
            inputProps={{ min: 0, max: 10 }}
            fullWidth
            helperText="0 ~ 10"
          />
        </Box>

        <Box sx={styles.infoBox}>
          <Typography variant="body2">
            사용 가능 포인트: <strong>{totalPoints}</strong>
          </Typography>
          {statType === "custom" && (
            <Typography
              variant="body2"
              color={isOverLimit ? "error" : "text.primary"}
            >
              남은 포인트: {totalPoints - usedPoints}
            </Typography>
          )}
        </Box>

        {isOverLimit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            사용 가능한 포인트를 초과했습니다!
          </Alert>
        )}
      </Paper>

      <Paper sx={styles.section}>
        <FormControl component="fieldset">
          <FormLabel component="legend">스탯 분배 방식</FormLabel>
          <RadioGroup
            row
            value={statType}
            onChange={(e) => setStatType(e.target.value)}
          >
            <FormControlLabel
              value="attack"
              control={<Radio />}
              label="All 공격력"
            />
            <FormControlLabel
              value="health"
              control={<Radio />}
              label="All 체력"
            />
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label="직접 입력"
            />
          </RadioGroup>
        </FormControl>

        {statType === "custom" && (
          <Box sx={styles.customInputs}>
            <TextField
              label="공격력 투자 포인트"
              type="number"
              value={customAttack}
              onChange={handleCustomStatChange(setCustomAttack)}
              fullWidth
              size="small"
            />
            <TextField
              label="체력 투자 포인트"
              type="number"
              value={customHealth}
              onChange={handleCustomStatChange(setCustomHealth)}
              fullWidth
              size="small"
            />
          </Box>
        )}
      </Paper>

      <Paper sx={styles.resultSection}>
        <Typography variant="h6" gutterBottom>
          적용 효과
        </Typography>
        <Box sx={styles.resultRow}>
          <Typography>최종 대미지 추가</Typography>
          <Typography color="primary" fontWeight="bold">
            +{finalDamageBonus.toFixed(2)}%
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>최대 마나</Typography>
          <Typography>{maxMana}</Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>마나 회복량</Typography>
          <Typography>{manaRegen.toFixed(2)} /초</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Level;
