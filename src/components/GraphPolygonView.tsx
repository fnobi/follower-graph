import { useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { pcp, percent, spp } from "~/lib/cssUtil";
import useCanvasAgent from "~/lib/useCanvasAgent";
import Dragger from "~/lib/Dragger";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import GraphPolygonPlayer from "~/local/GraphPolygonPlayer";
import { TwitterData } from "~/scheme/TwitterData";

export const calcFocusIndex = (list: TwitterData[], scroll: number) =>
  Math.round(scroll * (list.length - 1));

const canvasStyle = css({
  position: "fixed",
  left: percent(0),
  width: percent(100),
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

const GraphPolygonView = (props: {
  list: TwitterData[];
  entryIndexes: number[];
  scroll: number;
  onScroll: (fn: (s: number) => number) => void;
}) => {
  const { list, entryIndexes, scroll, onScroll } = props;
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
        scrollBy((-y + x) * 0.0002);
      },
      wheelHandler: (e: WheelEvent) => ({
        x: 0,
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
      player.setScroll(scroll);
    }
  }, [scroll]);

  return <div css={canvasStyle} ref={wrapperRef} />;
};

export default GraphPolygonView;
