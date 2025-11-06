export const root = {
  minHeight: "100dvh",
  bgcolor: { xs: "background.default", md: "#f5f7fb" },
  display: "grid",
  placeItems: "center",
  paddingBottom: "env(safe-area-inset-bottom)",
  paddingTop: "env(safe-area-inset-top)",
};

export const frame = {
  width: "100%",
  maxWidth: 430,
  minHeight: "100dvh",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  borderRadius: { xs: 0, md: 24 },
  overflow: "hidden",
  border: { md: "1px solid rgba(0,0,0,0.08)" },
  boxShadow: { md: "0 10px 40px rgba(0,0,0,0.08)" },
  background: "#fff",
};
