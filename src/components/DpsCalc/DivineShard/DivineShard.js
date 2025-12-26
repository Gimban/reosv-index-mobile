import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  Slider,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import * as styles from "./DivineShard.styles";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import { SHARDS, SHARED_STAT_INFO } from "./DivineShardData";

const calculateUsedPoints = (stats) => {
  return stats.reduce((acc, statLevel, idx) => {
    const statInfo = SHARED_STAT_INFO[idx];
    let cost = 0;
    for (let i = 1; i <= statLevel; i++) {
      cost += statInfo.reqPoints[i] || 0;
    }
    return acc + cost;
  }, 0);
};

const DivineShard = () => {
  const navigate = useNavigate();
  const { dpsState, updateDpsState } = useDpsCalc();
  const [showValidOnly, setShowValidOnly] = useState(true);

  // 초기 상태 설정
  useEffect(() => {
    // 데이터가 없거나 이전 버전의 데이터 형식일 경우 초기화
    const isInvalidState =
      !dpsState.divineShard || !dpsState.divineShard[SHARDS[0]?.id];

    if (isInvalidState) {
      const initialShardState = {};
      SHARDS.forEach((shard) => {
        initialShardState[shard.id] = {
          level: 0,
          stats: Array(SHARED_STAT_INFO.length).fill(0),
        };
      });
      updateDpsState("divineShard", initialShardState);
    }
  }, [dpsState.divineShard, updateDpsState]);

  if (!dpsState.divineShard) return null;

  const handleShardLevelChange = (shardId, event) => {
    const val = Number(event.target.value);
    const shardInfo = SHARDS.find((s) => s.id === shardId);
    if (!shardInfo) return;

    const clamped = Math.min(Math.max(0, val), shardInfo.maxLevel);
    updateDpsState("divineShard", {
      ...dpsState.divineShard,
      [shardId]: {
        ...dpsState.divineShard[shardId],
        level: clamped,
      },
    });
  };

  const handleStatChange = (shardId, statIndex, delta) => {
    const shardInfo = SHARDS.find((s) => s.id === shardId);
    const shardState = dpsState.divineShard[shardId];
    const statInfo = SHARED_STAT_INFO[statIndex];
    const currentStatLevel = shardState.stats[statIndex];
    const newStatLevel = currentStatLevel + delta;

    // 유효성 검사
    if (newStatLevel < 0) return;
    if (newStatLevel > shardInfo.maxStatLevel) return;

    // 포인트 계산
    const totalPoints = shardState.level * shardInfo.pointsPerLevel;
    const usedPoints = calculateUsedPoints(shardState.stats);
    const remainingPoints = totalPoints - usedPoints;

    // 포인트 부족 시 증가 불가 (감소는 가능)
    if (delta > 0) {
      const cost = statInfo.reqPoints[newStatLevel];
      if (remainingPoints < cost) return;
    }

    const newStats = [...shardState.stats];
    newStats[statIndex] = newStatLevel;

    updateDpsState("divineShard", {
      ...dpsState.divineShard,
      [shardId]: {
        ...shardState,
        stats: newStats,
      },
    });
  };

  return (
    <Box sx={styles.container}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={styles.title}>
          디바인 샤드
        </Typography>
        {SHARDS.length > 1 && (
          <FormControlLabel
            control={
              <Switch
                checked={showValidOnly}
                onChange={(e) => setShowValidOnly(e.target.checked)}
              />
            }
            label="유효 옵션만 표시"
          />
        )}
      </Box>

      {SHARDS.map((shard) => {
        const shardState = dpsState.divineShard[shard.id];
        if (!shardState) return null;

        const { level, stats } = shardState;

        const totalPoints = level * shard.pointsPerLevel;
        const usedPoints = calculateUsedPoints(stats);
        const remainingPoints = totalPoints - usedPoints;

        return (
          <Paper key={shard.id} elevation={3} sx={styles.content}>
            <Typography variant="h6">{shard.name}</Typography>
            {/* 샤드 레벨 설정 */}
            <Box>
              <Typography gutterBottom>
                샤드 레벨 (최대 {shard.maxLevel})
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs></Grid>
                <Grid item>
                  <TextField
                    value={level}
                    onChange={(e) => handleShardLevelChange(shard.id, e)}
                    type="number"
                    size="small"
                    inputProps={{
                      min: 0,
                      max: shard.maxLevel,
                      style: { width: "60px" },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* 포인트 현황 */}
            <Box sx={styles.statusBox}>
              <Typography>보유 포인트: {totalPoints}</Typography>
              <Typography color={remainingPoints < 0 ? "error" : "primary"}>
                남은 포인트: {remainingPoints}
              </Typography>
            </Box>

            {/* 능력치 설정 */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {SHARED_STAT_INFO.map((stat, index) => {
                if (
                  showValidOnly &&
                  shard.validStats &&
                  !shard.validStats.includes(stat.name)
                ) {
                  return null;
                }
                return (
                  <Box key={stat.name} sx={styles.statRow}>
                    <Box sx={styles.statHeader}>
                      <Typography variant="subtitle1">{stat.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lv.{stats[index]} / {shard.maxStatLevel} (
                        {stat.effects.map((effect, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && ", "}
                            {effect.name && effect.name !== stat.name
                              ? `${effect.name} `
                              : ""}
                            {(effect.values[stats[index]] || 0).toFixed(
                              effect.unit === "%" ? 1 : 0
                            )}
                            {effect.unit}
                          </React.Fragment>
                        ))}
                        )
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleStatChange(shard.id, index, -1)}
                        disabled={stats[index] <= 0}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Box sx={{ flex: 1, mx: 1 }}>
                        <Slider
                          value={stats[index]}
                          min={0}
                          max={shard.maxStatLevel}
                          disabled
                          size="small"
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleStatChange(shard.id, index, 1)}
                        disabled={
                          stats[index] >= shard.maxStatLevel ||
                          remainingPoints < stat.reqPoints[stats[index] + 1]
                        }
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="caption"
                      align="right"
                      color="text.secondary"
                    >
                      {stats[index] < shard.maxStatLevel
                        ? `비용: ${stat.reqPoints[stats[index] + 1]}pt`
                        : "최대 레벨"}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        );
      })}
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

export default DivineShard;
