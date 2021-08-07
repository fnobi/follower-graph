import { useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
import useCanvasAgent from "~/lib/useCanvasAgent";
import GraphCanvasElementPlayer from "~/local/GraphCanvasElementPlayer";
import { TwitterData } from "~/scheme/TwitterData";

const canvasStyle = css({
  position: "fixed",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100),
  canvas: {
    position: "absolute",
    top: percent(0),
    left: percent(0),
    width: percent(100),
    height: percent(100)
  }
});

const GraphCanvasElementView = (props: { list: TwitterData[] }) => {
  const { list } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { playerRef } = useCanvasAgent({
    initializer: () => new GraphCanvasElementPlayer(),
    wrapperRef
  });
  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setList(list);
    }
  }, [list, playerRef]);
  return <div css={canvasStyle} ref={wrapperRef} />;
};

export default GraphCanvasElementView;
