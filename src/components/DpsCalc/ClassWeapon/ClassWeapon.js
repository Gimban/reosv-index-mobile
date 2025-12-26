import React, { useState, useEffect, useContext } from "react";
import Papa from "papaparse";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CacheContext } from "../../../contexts/CacheContext";
import { useDpsCalc } from "../../../contexts/DpsCalcContext";
import * as styles from "./ClassWeapon.styles";

const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "1281476028";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

// 스킬 정보를 표시하는 컴포넌트
const SkillInfo = ({ data }) => {
  if (!data) return null;

  const skills = [
    { name: "좌클릭", damageKey: "좌클릭 피해량", cdKey: "좌클릭 쿨타임" },
    { name: "우클릭", damageKey: "우클릭 피해량", cdKey: "우클릭 쿨타임" },
    {
      name: "쉬프트 좌클릭",
      damageKey: "쉬프트 좌클릭 피해량",
      cdKey: "쉬프트 좌클릭 쿨타임",
    },
    {
      name: "쉬프트 우클릭",
      damageKey: "쉬프트 우클릭 피해량",
      cdKey: "쉬프트 우클릭 쿨타임",
    },
  ];

  return (
    <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
      <Table size="small">
        <TableBody>
          {skills.map((skill) => {
            const damage = data[skill.damageKey];
            const cooldown = data[skill.cdKey];

            const damageStr = String(damage || "");
            const cooldownStr = String(cooldown || "");

            const isDamageEmpty =
              !damageStr || damageStr.trim() === "" || damageStr.trim() === "0";
            const isCooldownEmpty =
              !cooldownStr ||
              cooldownStr.trim() === "" ||
              cooldownStr.trim() === "0";

            if (isDamageEmpty && isCooldownEmpty) return null;

            return (
              <React.Fragment key={skill.name}>
                <TableRow>
                  <TableCell component="th" scope="row" rowSpan={2}>
                    {skill.name}
                  </TableCell>
                  <TableCell>피해량</TableCell>
                  <TableCell align="right">{damageStr || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>쿨타임</TableCell>
                  <TableCell align="right">{cooldownStr || "-"}</TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ClassWeapon = () => {
  const navigate = useNavigate();
  const { cache, setCacheValue } = useContext(CacheContext);
  const { dpsState, updateDpsState } = useDpsCalc();

  const [allClasses, setAllClasses] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 초기 상태는 항상 빈 값으로 설정하여 MUI 경고를 방지
  const [selectedClass, setSelectedClass] = useState("");
  const [advancements, setAdvancements] = useState([]);
  const [selectedAdvancement, setSelectedAdvancement] = useState("");
  const [enhancements, setEnhancements] = useState([]);
  const [selectedEnhancement, setSelectedEnhancement] = useState("");
  const [selectedStats, setSelectedStats] = useState(null);

  // 데이터 로드 후 전역 상태를 적용했는지 추적하는 상태
  const [isGlobalStateApplied, setIsGlobalStateApplied] = useState(false);

  // 1. 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (cache.classes) {
        setAllClasses(cache.classes);
        setLoading(false);
      } else {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(SHEET_URL);
          if (!response.ok) {
            throw new Error("데이터를 가져오는 데 실패했습니다.");
          }
          const csvText = await response.text();
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // 숫자 자동 변환
            complete: (results) => {
              const classData = results.data.filter(
                (row) => row["클래스"] && String(row["클래스"]).trim() !== ""
              );
              setCacheValue("classes", classData);
              setAllClasses(classData);
              setLoading(false);
            },
            error: (err) => {
              throw new Error(err.message);
            },
          });
        } catch (e) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [cache.classes, setCacheValue]);

  // 2. 데이터 로딩 후, 전역 상태를 순차적으로 적용
  useEffect(() => {
    if (allClasses.length === 0) return;

    // 클래스 목록 채우기
    const uniqueCls = [
      ...new Set(allClasses.map((item) => item["클래스"])),
    ].sort();
    setUniqueClasses(uniqueCls);

    // 전역 상태 적용 로직
    if (dpsState.classStats && !isGlobalStateApplied) {
      const {
        클래스: className,
        "전직 차수": advName,
        "강화 차수": enhName,
      } = dpsState.classStats;

      if (uniqueCls.includes(className)) {
        // 1. 클래스 설정
        setSelectedClass(className);

        // 2. 전직 차수 목록 생성 및 설정
        const advs = [
          ...new Set(
            allClasses
              .filter((c) => c["클래스"] === className)
              .map((c) => c["전직 차수"])
          ),
        ].sort((a, b) => a - b);
        setAdvancements(advs);
        if (advs.includes(advName)) {
          setSelectedAdvancement(advName);

          // 3. 강화 차수 목록 생성 및 설정
          const enhs = [
            ...new Set(
              allClasses
                .filter(
                  (c) => c["클래스"] === className && c["전직 차수"] === advName
                )
                .map((c) => c["강화 차수"])
            ),
          ].sort((a, b) => a - b);
          setEnhancements(enhs);
          if (enhs.includes(enhName)) {
            setSelectedEnhancement(enhName);
          }
        }
        // 전체 스탯 정보 설정
        setSelectedStats(dpsState.classStats);
      }
      setIsGlobalStateApplied(true);
    }
  }, [allClasses, dpsState.classStats, isGlobalStateApplied]);

  // 3. 사용자 선택에 따른 드롭다운 메뉴 업데이트
  useEffect(() => {
    if (!selectedClass) return;
    const advs = [
      ...new Set(
        allClasses
          .filter((c) => c["클래스"] === selectedClass)
          .map((c) => c["전직 차수"])
      ),
    ].sort((a, b) => a - b);
    setAdvancements(advs);
  }, [selectedClass, allClasses]);

  useEffect(() => {
    if (!selectedAdvancement) return;
    const selectedAdvNumber = parseInt(selectedAdvancement, 10);
    const enhs = [
      ...new Set(
        allClasses
          .filter(
            (c) =>
              c["클래스"] === selectedClass &&
              c["전직 차수"] === selectedAdvNumber
          )
          .map((c) => c["강화 차수"])
      ),
    ].sort((a, b) => a - b);
    setEnhancements(enhs);
  }, [selectedAdvancement, selectedClass, allClasses]);

  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    // 하위 선택 초기화
    setSelectedAdvancement("");
    setAdvancements([]);
    setSelectedEnhancement("");
    setEnhancements([]);
    setSelectedStats(null);
  };

  const handleAdvancementChange = (e) => {
    const newAdv = e.target.value;
    setSelectedAdvancement(newAdv);
    // 하위 선택 초기화
    setSelectedEnhancement("");
    setEnhancements([]);
    setSelectedStats(null);
  };

  const handleEnhancementChange = (e) => {
    const newEnh = e.target.value;
    setSelectedEnhancement(newEnh);

    const selectedAdvNumber = parseInt(selectedAdvancement, 10);
    const newEnhNumber = parseInt(newEnh, 10);

    const stats = allClasses.find(
      (c) =>
        c["클래스"] === selectedClass &&
        c["전직 차수"] === selectedAdvNumber &&
        c["강화 차수"] === newEnhNumber
    );
    setSelectedStats(stats || null);
  };

  const handleSave = () => {
    if (!selectedStats) {
      alert("클래스, 전직 차수, 강화 차수를 모두 선택해야 합니다.");
      return;
    }
    updateDpsState("classStats", selectedStats);
    navigate("/dps_calc");
  };

  // 로딩 및 에러 UI
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>클래스 데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography color="error">오류: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        클래스 능력치 설정
      </Typography>
      <Box component="form" sx={styles.form}>
        <TextField
          select
          label="클래스 선택"
          value={selectedClass}
          onChange={handleClassChange}
          fullWidth
          slotProps={{ select: { inputProps: { "aria-hidden": "false" } } }}
          disablerestorefocus="true"
        >
          {uniqueClasses.map((cls) => (
            <MenuItem key={cls} value={cls}>
              {cls}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="전직 차수"
          value={selectedAdvancement}
          onChange={handleAdvancementChange}
          fullWidth
          disabled={!selectedClass}
          slotProps={{ select: { inputProps: { "aria-hidden": "false" } } }}
          disablerestorefocus="true"
        >
          {advancements.map((adv) => (
            <MenuItem key={adv} value={adv}>
              {adv}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="강화 단계"
          value={selectedEnhancement}
          onChange={handleEnhancementChange}
          fullWidth
          disabled={!selectedAdvancement}
          slotProps={{ select: { inputProps: { "aria-hidden": "false" } } }}
          disablerestorefocus="true"
        >
          {enhancements.map((enh) => (
            <MenuItem key={enh} value={enh}>
              {enh}
            </MenuItem>
          ))}
        </TextField>

        <SkillInfo data={selectedStats} />

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
