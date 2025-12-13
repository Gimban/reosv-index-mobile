import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import Papa from "papaparse";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Modal,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import { CacheContext } from "../../../contexts/CacheContext";
import * as styles from "./SpecialWeapon.styles";

// Weapons.js와 동일한 Google Sheet 정보를 사용합니다.
const BASE_URL_ID = "1IZra9ZZRwBBgT4ai1W0fCATeFFsztHnF0k03DmLr1tI";
const GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${BASE_URL_ID}/export?format=csv&gid=${GID}`;

// 무기 이미지 로드
const images = require.context(
  "../../../assets/images/weapons",
  false,
  /\.(png|jpe?g|svg|webp)$/
);

const weaponImages = images.keys().reduce((acc, item) => {
  const key = item.replace("./", "");
  acc[key] = images(item);
  return acc;
}, {});

export default function SpecialWeapon() {
  const { cache, setCacheValue } = useContext(CacheContext);
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeaponName, setSelectedWeaponName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (cache.weapons) {
        setWeapons(cache.weapons);
        setLoading(false);
        return;
      }

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
          complete: (results) => {
            const allWeaponsData = results.data.filter(
              (row) => row["이름"] && row["이름"].trim() !== ""
            );
            setWeapons(allWeaponsData);
            setCacheValue("weapons", allWeaponsData);
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
    };

    fetchData();
  }, [cache.weapons, setCacheValue]);

  const getBaseWeaponData = useCallback(
    (name) => {
      return (
        weapons.find(
          (w) => w["이름"] === name && parseInt(w["강화 차수"], 10) === 0
        ) || weapons.find((w) => w["이름"] === name)
      );
    },
    [weapons]
  );

  const uniqueWeaponNames = useMemo(() => {
    // 하드코딩으로 제외할 무기 이름 목록
    const excludedNames = new Set([
      // 여기에 제외할 무기 이름을 추가하세요. 예: "제외할 무기"
      "방랑자, 플레탄",
    ]);

    // 하드코딩으로 제외할 무기 등급 목록
    const excludedGrades = new Set([
      // 여기에 제외할 등급을 추가하세요. 예: "일반"
      "보스",
      "운명",
      "기타",
    ]);

    // 각 무기 이름의 등장 횟수를 계산합니다.
    const nameCounts = weapons.reduce((acc, w) => {
      const name = w["이름"];
      if (name) {
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {});

    // 모든 고유한 무기 이름 목록을 가져옵니다.
    const allUniqueNames = Array.from(new Set(weapons.map((w) => w["이름"])));

    // 필터링 적용:
    // 1. 강화 단계가 2개 이상 (강화 가능)
    // 2. 제외 이름 목록에 포함되지 않음
    // 3. 제외 등급 목록에 포함되지 않음
    return allUniqueNames.filter((name) => {
      if (!name || nameCounts[name] <= 1 || excludedNames.has(name)) {
        return false;
      }
      const weapon = getBaseWeaponData(name);
      return weapon && !excludedGrades.has(weapon["등급"]);
    });
  }, [weapons, getBaseWeaponData]);

  const selectedWeaponData = useMemo(() => {
    if (!selectedWeaponName) return null;
    // 0강 데이터를 우선적으로 찾거나, 없으면 첫 번째 데이터를 사용
    return (
      weapons.find(
        (w) =>
          w["이름"] === selectedWeaponName && parseInt(w["강화 차수"], 10) === 0
      ) || weapons.find((w) => w["이름"] === selectedWeaponName)
    );
  }, [weapons, selectedWeaponName]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleWeaponSelect = (name) => {
    setSelectedWeaponName(name);
    handleCloseModal();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">오류: {error}</Typography>;

  return (
    <Box sx={{ mb: 2 }}>
      <Button variant="contained" onClick={handleOpenModal} fullWidth>
        {selectedWeaponName || "무기 선택"}
      </Button>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={styles.modalStyle}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            무기 선택
          </Typography>
          <Box sx={styles.modalGrid}>
            {uniqueWeaponNames.map((name) => {
              const weapon = getBaseWeaponData(name);
              if (!weapon) return null;
              return (
                <Card key={name} sx={styles.modalWeaponCard(weapon["등급"])}>
                  <CardActionArea onClick={() => handleWeaponSelect(name)}>
                    <CardMedia
                      component="img"
                      sx={styles.modalWeaponImage}
                      image={weaponImages[`${weapon["이미지 파일"]}.webp`]}
                      alt={name}
                    />
                    <CardContent sx={{ p: 0 }}>
                      <Typography sx={styles.modalWeaponName}>
                        {name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Modal>

      {selectedWeaponData && (
        <Paper elevation={3} sx={{ ...styles.selectedWeaponPaper, mt: 2 }}>
          <Box
            component="img"
            src={weaponImages[`${selectedWeaponData["이미지 파일"]}.webp`]}
            alt={selectedWeaponData["이름"]}
            sx={styles.weaponImage}
          />
          <Box>
            <Typography variant="h6" sx={styles.weaponName}>
              {selectedWeaponData["이름"]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              등급: {selectedWeaponData["등급"]}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
