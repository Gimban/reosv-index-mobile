import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, Paper, BottomNavigation,
  BottomNavigationAction, Container, Button
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    // 데스크톱에서도 '모바일 화면'을 중앙에 고정
    <Box sx={{
      minHeight: "100dvh",
      bgcolor: { xs: "background.default", md: "#f5f7fb" },
      display: "grid",
      placeItems: "center",
      paddingBottom: "env(safe-area-inset-bottom)",
      paddingTop: "env(safe-area-inset-top)",
    }}>
      <Paper elevation={0} sx={{
        width: "100%",
        maxWidth: 430,           // 390~430 중 택1
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        borderRadius: { xs: 0, md: 24 },
        overflow: "hidden",
        border: { md: "1px solid rgba(0,0,0,0.08)" },
        boxShadow: { md: "0 10px 40px rgba(0,0,0,0.08)" },
        background: "#fff",
      }}>
        {/* 상단 앱바 */}
        <AppBar position="static">
          <Toolbar sx={{ minHeight: 56 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              My Mobile App
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 스크롤 본문 */}
        <Box component="main" sx={{ overflowY: "auto" }}>
          <Container sx={{ py: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              모바일 퍼스트 카드
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              PC에서도 동일/유사 UI가 되도록 최대폭을 고정했습니다.
            </Typography>

            <Box sx={{ display: "grid", gap: 1.5 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Paper key={i} sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: .5 }}>아이템 #{i + 1}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    터치 타겟, 타이포, 라운드가 모바일 기준으로 통일되어 있습니다.
                  </Typography>
                  <Button variant="contained" fullWidth>액션</Button>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        {/* 하단 바 */}
        <Paper square sx={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <BottomNavigation value={tab} onChange={(_, v) => setTab(v)} showLabels>
            <BottomNavigationAction label="홈" icon={<HomeRoundedIcon />} />
            <BottomNavigationAction label="검색" icon={<SearchRoundedIcon />} />
            <BottomNavigationAction label="내 정보" icon={<PersonRoundedIcon />} />
          </BottomNavigation>
        </Paper>
      </Paper>
    </Box>
  );
}
