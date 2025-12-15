import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from "@mui/material";
import Papa from "papaparse";
import { CacheContext } from "../../../contexts/CacheContext";

const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "882618671"; // 클래스 무기 강화 데이터 시트 GID
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

export default function ClassWeapon() {
  const { cache, setCacheValue } = useContext(CacheContext);
  const [data, setData] = useState(cache.classWeaponEnh || null);
  const [loading, setLoading] = useState(!cache.classWeaponEnh);
  const [fetchError, setFetchError] = useState(null);

  const [currentAdvTier, setCurrentAdvTier] = useState("");
  const [currentEnhanceLevel, setCurrentEnhanceLevel] = useState("");
  const [targetAdvTier, setTargetAdvTier] = useState("");
  const [targetEnhanceLevel, setTargetEnhanceLevel] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (cache.classWeaponEnh) {
        setData(cache.classWeaponEnh);
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
          throw new Error("데이터를 가져오는 데 실패했습니다.");
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data.filter(
              (row) => row["전직 차수"] && row["강화 차수"]
            );
            setData(parsedData);
            setCacheValue("classWeaponEnh", parsedData);
            setLoading(false);
          },
          error: (err) => {
            throw new Error(err.message);
          },
        });
      } catch (e) {
        setFetchError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [cache.classWeaponEnh, setCacheValue]);

  const advTiers = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((item) => item["전직 차수"]))].sort(
      (a, b) => a - b
    );
  }, [data]);

  const getEnhanceLevels = useCallback(
    (tier) => {
      if (!data || !tier) return [];
      return data
        .filter((item) => item["전직 차수"] === tier)
        .map((item) => item["강화 차수"])
        .sort((a, b) => a - b);
    },
    [data]
  );

  const currentEnhanceLevels = useMemo(
    () => getEnhanceLevels(currentAdvTier),
    [getEnhanceLevels, currentAdvTier]
  );
  const targetEnhanceLevels = useMemo(
    () => getEnhanceLevels(targetAdvTier),
    [getEnhanceLevels, targetAdvTier]
  );

  const { totalCost, error } = useMemo(() => {
    if (
      !data ||
      currentAdvTier === "" ||
      currentEnhanceLevel === "" ||
      targetAdvTier === "" ||
      targetEnhanceLevel === ""
    ) {
      return { totalCost: null, error: null };
    }

    if (
      currentAdvTier > targetAdvTier ||
      (currentAdvTier === targetAdvTier &&
        currentEnhanceLevel >= targetEnhanceLevel)
    ) {
      return {
        totalCost: null,
        error: "목표 단계는 현재 단계보다 높아야 합니다.",
      };
    }

    const resources = [
      "골드",
      "무형의 파편",
      "강화 재료 1",
      "강화 재료 2",
      "강화 재료 3",
    ];
    const total = {
      골드: 0,
      "무형의 파편": 0,
    };

    const startIndex = data.findIndex(
      (d) =>
        d["전직 차수"] === currentAdvTier &&
        d["강화 차수"] === currentEnhanceLevel
    );
    const endIndex = data.findIndex(
      (d) =>
        d["전직 차수"] === targetAdvTier &&
        d["강화 차수"] === targetEnhanceLevel
    );

    // 현재 단계의 다음 단계부터 목표 단계까지의 비용을 합산합니다.
    for (let i = startIndex + 1; i <= endIndex; i++) {
      resources.forEach((res) => {
        const value = data[i][res];
        if (value) {
          if (res.startsWith("강화 재료")) {
            const match = value.match(/([^\d]+)\s*(\d+)/);
            if (match) {
              const [, name, amount] = match;
              total[name.trim()] =
                (total[name.trim()] || 0) + parseInt(amount, 10);
            }
          } else {
            total[res] = (total[res] || 0) + parseInt(value, 10);
          }
        }
      });
    }

    return { totalCost: total, error: null };
  }, [
    data,
    currentAdvTier,
    currentEnhanceLevel,
    targetAdvTier,
    targetEnhanceLevel,
  ]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>강화 비용 정보를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  const renderSelector = (label, value, handler, options) => (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => handler(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        클래스 무기 강화 시뮬레이터
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">현재 단계</Typography>
        {renderSelector(
          "전직 차수",
          currentAdvTier,
          setCurrentAdvTier,
          advTiers
        )}
        {renderSelector(
          "강화 레벨",
          currentEnhanceLevel,
          setCurrentEnhanceLevel,
          currentEnhanceLevels
        )}
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">목표 단계</Typography>
        {renderSelector("전직 차수", targetAdvTier, setTargetAdvTier, advTiers)}
        {renderSelector(
          "강화 레벨",
          targetEnhanceLevel,
          setTargetEnhanceLevel,
          targetEnhanceLevels
        )}
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {totalCost && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={2}
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                >
                  필요 재료 총합
                </TableCell>
              </TableRow>
              {Object.entries(totalCost).map(
                ([key, value]) =>
                  value > 0 && (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell align="right">
                        {value.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
