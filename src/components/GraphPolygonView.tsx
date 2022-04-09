import { FC, useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { pcp, percent, px, spp } from "~/lib/cssUtil";
import useCanvasAgent from "~/lib/useCanvasAgent";
import Dragger from "~/lib/Dragger";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import GraphPolygonPlayer from "~/local/GraphPolygonPlayer";
import { THEME_GRAPH_BG } from "~/local/commonCss";
import { TwitterData } from "~/scheme/TwitterData";

export const calcFocusIndex = (list: TwitterData[], scroll: number) =>
  Math.round(scroll * (list.length - 1));

const canvasStyle = css({
  position: "fixed",
  left: percent(0),
  width: percent(100),
  backgroundColor: THEME_GRAPH_BG,
  borderTop: `solid ${px(1)} rgba(255,255,255,0.2)`,
  canvas: {
    position: "absolute",
    top: percent(0),
    left: percent(0),
    width: percent(100),
    height: percent(100)
  },
  [MQ_MOBILE]: {
    top: spp(400),
    bottom: spp(650)
  },
  [MQ_DESKTOP]: {
    top: pcp(400),
    bottom: pcp(650)
  }
});

const GraphPolygonView: FC<{
  list: TwitterData[];
  entryIndexes: number[];
  axisIndexes: number[];
  graphZoom: number;
  setGraphZoom: (fn: (z: number) => number) => void;
  scroll: number;
  onScroll: (fn: (s: number) => number) => void;
}> = ({
  list,
  entryIndexes,
  axisIndexes,
  graphZoom,
  setGraphZoom,
  scroll,
  onScroll
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { playerRef } = useCanvasAgent({
    initializer: () => new GraphPolygonPlayer(),
    wrapperRef
  });

  const scrollBy = (delta: number) => {
    onScroll(s => s + delta);
  };

  useEffect(() => {
    const { current: wrapper } = wrapperRef;
    if (!wrapper) {
      return () => {};
    }
    const dragger = new Dragger({
      els: [wrapper],
      onMove: ({ x, y }) => {
        scrollBy(x * 0.02);
        setGraphZoom(z => z + y * 0.01);
      },
      wheelHandler: (e: WheelEvent) => ({
        x: -e.deltaX * 0.3,
        y: -e.deltaY * 0.3,
        z: 0
      }),
      preventDefault: true
    });
    return () => dragger.destroy();
  }, []);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setList(list);
    }
  }, [list]);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setEntryIndexes(entryIndexes);
    }
  }, [entryIndexes]);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setAxisIndexes(axisIndexes);
    }
  }, [axisIndexes]);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setScroll(scroll);
    }
  }, [scroll]);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setGraphZoom(graphZoom);
    }
  }, [graphZoom]);

  return <div css={canvasStyle} ref={wrapperRef} />;
};

export default GraphPolygonView;
