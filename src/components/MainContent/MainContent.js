import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardActionArea,
} from "@mui/material";
import * as styles from "./MainContent.styles";

const menuItems = [
  {
    title: "특수 무기",
    description: "게임 내 모든 무기 정보를 확인하세요.",
    path: "/weapons",
  },
  {
    title: "강화 시뮬레이터",
    description: "무기 강화 비용과 확률을 시뮬레이션 해보세요.",
    path: "/enh_sim",
  },
  {
    title: "직업 무기",
    description: "각 직업별 정보를 확인하세요.",
    path: "/class",
  },
];

export default function MainContent() {
  return (
    <Box component="main" sx={styles.main}>
      <Container sx={styles.container}>
        <Box sx={styles.list}>
          {menuItems.map((item) => (
            <Card key={item.path} component={Paper} sx={styles.card}>
              <CardActionArea
                component={RouterLink}
                to={item.path}
                sx={{ p: 2 }}
              >
                <Typography sx={styles.cardTitle}>{item.title}</Typography>
                <Typography color="text.secondary" sx={styles.cardBody}>
                  {item.description}
                </Typography>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
