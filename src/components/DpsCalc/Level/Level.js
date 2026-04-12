import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Alert,
  Button,
} from "@mui/material";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import { STAT_MAPPINGS } from "../../../utils/statMappings";
import { useSynergyCalculator } from "./useSynergyCalculator";
import * as styles from "./Level.styles";

const Level = () => {
  const navigate = useNavigate();
  const { dpsState, updateDpsState } = useDpsCalc();

  // 전역 상태에서 초기값 로드, 없으면 기본값 사용
  const [level, setLevel] = useState(dpsState.level || 1);
  // 개편된 스탯: 힘(STR), 민첩(SPD), 활력(VIT)
  const [str, setStr] = useState(dpsState.str || 0);
  const [spd, setSpd] = useState(dpsState.spd || 0);
  const [vit, setVit] = useState(dpsState.vit || 0);

  // 시너지 보너스 계산 (상태 바로 아래에 배치하여 데이터 흐름을 명확히 함)
  const synergyBonuses = useSynergyCalculator({ str, spd, vit });

  // 상태 변경 시 전역 상태 업데이트
  useEffect(() => {
    updateDpsState("level", level);
    updateDpsState("str", str);
    updateDpsState("spd", spd);
    updateDpsState("vit", vit);
    // 계산된 시너지를 전역 상태에 저장하여 useFinalStats에서 참조 가능하게 함
    updateDpsState("synergyBonuses", synergyBonuses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, str, spd, vit, synergyBonuses]);

  // 사용 가능한 총 포인트 (레벨)
  const totalPoints = Math.max(0, level);

  // 현재 사용된 포인트 계산
  const usedPoints = useMemo(() => {
    const s = parseInt(str, 10) || 0;
    const a = parseInt(spd, 10) || 0;
    const v = parseInt(vit, 10) || 0;
    return s + a + v;
  }, [str, spd, vit]);

  // 포인트 초과 여부 검사
  const isOverLimit = useMemo(() => {
    return usedPoints > totalPoints;
  }, [usedPoints, totalPoints]);

  // 단일 스탯 100포인트 초과 여부 검사 (커스텀 모드)
  // const isStatLimitExceeded = useMemo(() => { ... }); // 제한 사라짐

  // 최종 대미지 추가 수치 계산
  const finalDamageBonus = useMemo(() => {
    if (isOverLimit) return 0;

    const s = parseInt(str, 10) || 0;
    const a = parseInt(spd, 10) || 0;
    const v = parseInt(vit, 10) || 0;

    // 힘 1포인트당 최종 데미지 +0.65%
    // 민첩&활력 1포인트당 최종 데미지 +0.4%
    return s * 0.65 + (a + v) * 0.4;
  }, [str, spd, vit, isOverLimit]);

  // 개편된 스탯 기본 보너스 계산
  const statBonuses = useMemo(() => {
    if (isOverLimit)
      return {
        classBasicAttackDamage: 0,
        classBasicAttackPercent: 0,
        cooldownReductionPercent: 0,
        classSkillDamagePercent: 0,
        moveSpeed: 0,
        maxHealthPercent: 0,
      };

    const s = parseInt(str, 10) || 0;
    const a = parseInt(spd, 10) || 0;
    const v = parseInt(vit, 10) || 0;

    return {
      classBasicAttackDamage: s * 5, // 기본 공격 피해량 +5
      classBasicAttackPercent: s * 0.3, // 기본 공격 피해량 +0.3%
      cooldownReductionPercent: a * 0.1, // 쿨타임 감소 +0.1%
      classSkillDamagePercent: a * 0.3, // 스킬 피해량 0.3%
      moveSpeed: Math.min(0.1, a * 0.005), // 이동 속도 +0.005 (+0.1 까지 제한)
      maxHealthPercent: v * 0.2, // 최대 체력 +0.2%
    };
  }, [str, spd, vit, isOverLimit]);

  // 마나 관련 계산 (5레벨당 증가)
  const maxMana = 100 + Math.floor(level / 5) * 5;
  const manaRegen = 4 + Math.floor(level / 5) * 0.05;

  // 핸들러
  const handleLevelChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) setLevel("");
    else setLevel(Math.min(110, Math.max(1, val)));
  };

  const handleStatChange = (setter) => (e) => {
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
            inputProps={{ min: 1, max: 110 }}
            fullWidth
            helperText="1 ~ 110"
          />
        </Box>

        <Box sx={styles.infoBox}>
          <Typography variant="body2">
            사용 가능 포인트: <strong>{totalPoints}</strong>
          </Typography>
          <Typography
            variant="body2"
            color={isOverLimit ? "error" : "text.primary"}
          >
            남은 포인트: {totalPoints - usedPoints}
          </Typography>
        </Box>

        {isOverLimit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            사용 가능한 포인트를 초과했습니다!
          </Alert>
        )}
      </Paper>

      <Paper sx={styles.section}>
        <Box sx={styles.customInputs}>
          <TextField
            label="힘 (STR)"
            type="number"
            value={str}
            onChange={handleStatChange(setStr)}
            fullWidth
            size="small"
          />
          <TextField
            label="민첩 (SPD)"
            type="number"
            value={spd}
            onChange={handleStatChange(setSpd)}
            fullWidth
            size="small"
          />
          <TextField
            label="활력 (VIT)"
            type="number"
            value={vit}
            onChange={handleStatChange(setVit)}
            fullWidth
            size="small"
          />
        </Box>
      </Paper>

      <Paper sx={styles.resultSection}>
        <Typography variant="h6" gutterBottom>
          적용 효과
        </Typography>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.finalDamagePercent}</Typography>
          <Typography color="primary" fontWeight="bold">
            +
            {(
              finalDamageBonus + (synergyBonuses.finalDamagePercent || 0)
            ).toFixed(2)}
            %
            {synergyBonuses.finalDamagePercent > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                (시너지 +{synergyBonuses.finalDamagePercent}%)
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.classBasicAttackDamage}</Typography>
          <Typography>+{statBonuses.classBasicAttackDamage}</Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.classBasicAttackPercent}</Typography>
          <Typography>
            +
            {(
              statBonuses.classBasicAttackPercent +
              (synergyBonuses.classBasicAttackPercent || 0)
            ).toFixed(1)}
            %
            {synergyBonuses.classBasicAttackPercent > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                (시너지 +{synergyBonuses.classBasicAttackPercent}%)
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.classSkillDamagePercent}</Typography>
          <Typography>
            +
            {(
              statBonuses.classSkillDamagePercent +
              (synergyBonuses.classSkillDamagePercent || 0)
            ).toFixed(1)}
            %
            {synergyBonuses.classSkillDamagePercent > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                (시너지 +{synergyBonuses.classSkillDamagePercent}%)
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.cooldownReductionPercent}</Typography>
          <Typography>
            +{statBonuses.cooldownReductionPercent.toFixed(1)}%
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.moveSpeed}</Typography>
          <Typography>
            +
            {(statBonuses.moveSpeed + (synergyBonuses.moveSpeed || 0)).toFixed(
              3,
            )}
            {synergyBonuses.moveSpeed > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                (시너지 +{synergyBonuses.moveSpeed})
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>{STAT_MAPPINGS.maxHealthPercent}</Typography>
          <Typography>
            +
            {(
              statBonuses.maxHealthPercent +
              (synergyBonuses.maxHealthPercent || 0)
            ).toFixed(1)}
            %
            {synergyBonuses.maxHealthPercent > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                (시너지 +{synergyBonuses.maxHealthPercent}%)
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>최대 마나 (레벨 기반)</Typography>
          <Typography>{maxMana}</Typography>
        </Box>
        <Box sx={styles.resultRow}>
          <Typography>마나 회복량 (레벨 기반)</Typography>
          <Typography>{manaRegen.toFixed(2)} /초</Typography>
        </Box>
      </Paper>
      <Button
        variant="contained"
        fullWidth
        onClick={() => navigate("/dps_calc")}
        sx={{ mt: 2 }}
      >
        확인
      </Button>
    </Box>
  );
};

export default Level;
