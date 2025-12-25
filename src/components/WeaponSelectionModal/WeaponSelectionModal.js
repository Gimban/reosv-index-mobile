import React, { useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import * as styles from "./WeaponSelectionModal.styles";

// 무기 이미지 로드
const images = require.context(
  "../../assets/images/weapons",
  false,
  /\.(png|jpe?g|svg|webp)$/
);
const weaponImages = images.keys().reduce((acc, item) => {
  const key = item.replace("./", "");
  acc[key] = images(item);
  return acc;
}, {});

const WeaponSelectionModal = ({
  open,
  onClose,
  onWeaponSelect,
  weaponsData,
  excludedNames = new Set(),
  excludedGrades = new Set(),
}) => {
  const getBaseWeaponData = (name) => {
    return (
      weaponsData.find(
        (w) => w["이름"] === name && parseInt(w["강화 차수"], 10) === 0
      ) || weaponsData.find((w) => w["이름"] === name)
    );
  };

  const uniqueWeaponNames = useMemo(() => {
    if (!weaponsData) return [];

    const nameCounts = weaponsData.reduce((acc, w) => {
      const name = w["이름"];
      if (name) {
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {});

    const allUniqueNames = Array.from(
      new Set(weaponsData.map((w) => w["이름"]))
    );

    return allUniqueNames.filter((name) => {
      if (!name || nameCounts[name] <= 1 || excludedNames.has(name)) {
        return false;
      }
      const weapon = getBaseWeaponData(name);
      return weapon && !excludedGrades.has(weapon["등급"]);
    });
  }, [weaponsData, excludedNames, excludedGrades]);

  return (
    <Modal open={open} onClose={onClose}>
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
                <CardActionArea onClick={() => onWeaponSelect(name)}>
                  <CardMedia
                    component="img"
                    sx={styles.modalWeaponImage}
                    image={weaponImages[`${weapon["이미지 파일"]}.webp`]}
                    alt={name}
                  />
                  <CardContent sx={{ p: 0 }}>
                    <Typography sx={styles.modalWeaponName}>{name}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Modal>
  );
};

export default WeaponSelectionModal;
