export const wrapper = (theme) => ({
  flexShrink: 0,
  borderTop: `1px solid ${theme.palette.divider}`,
  position: "sticky",
  bottom: 0,
  zIndex: theme.zIndex.appBar,
});
