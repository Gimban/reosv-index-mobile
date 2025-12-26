import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Slider,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import * as styles from "./Guild.styles";

// 길드 스킬 설정 데이터
// id: 상태 저장 키, label: 화면 표시 이름, maxLevel: 최대 레벨, options: 레벨당 증가하는 옵션 목록
const GUILD_SKILLS = [
  {
    id: "atk_percent",
    label: "길드원의 유대",
    maxLevel: 6,
    options: [
      { label: "최대 체력 스탯", valuePerLevel: 1, unit: "" },
      { label: "최종 공격력 스탯", valuePerLevel: 1, unit: "" },
    ],
  },
];

const Guild = () => {
  const navigate = useNavigate();
  const { dpsState, updateDpsState } = useDpsCalc();
  const guildState = dpsState.guild || {};

  const handleLevelChange = (id, newValue, maxLevel) => {
    let level = parseInt(newValue, 10);
    if (isNaN(level)) level = 1;

    // 최대 레벨 제한
    if (level < 1) level = 1;
    if (level > maxLevel) level = maxLevel;

    updateDpsState("guild", {
      ...guildState,
      [id]: level,
    });
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        길드
      </Typography>
      <Paper sx={styles.paper}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          길드 스킬 레벨 설정
        </Typography>
        <Stack spacing={2}>
          {GUILD_SKILLS.map((skill) => {
            const currentLevel = guildState[skill.id] || 1;

            return (
              <Box key={skill.id} sx={styles.skillItem}>
                <Typography gutterBottom>
                  {skill.label} (Lv. {currentLevel} / {skill.maxLevel})
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleLevelChange(
                        skill.id,
                        currentLevel - 1,
                        skill.maxLevel
                      )
                    }
                    disabled={currentLevel <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Slider
                    value={currentLevel}
                    min={1}
                    max={skill.maxLevel}
                    step={1}
                    onChange={(_, value) =>
                      handleLevelChange(skill.id, value, skill.maxLevel)
                    }
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleLevelChange(
                        skill.id,
                        currentLevel + 1,
                        skill.maxLevel
                      )
                    }
                    disabled={currentLevel >= skill.maxLevel}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                {skill.options.map((option, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="primary"
                    sx={{ mt: 0.5, fontWeight: "bold", textAlign: "right" }}
                  >
                    {option.label}: +{(currentLevel - 1) * option.valuePerLevel}
                    {option.unit}
                  </Typography>
                ))}
              </Box>
            );
          })}
        </Stack>
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

export default Guild;
