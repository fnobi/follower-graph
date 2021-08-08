import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100)
});

const LoadingView = () => {
  return <div css={wrapperStyle}>loading...</div>;
};

export default LoadingView;
