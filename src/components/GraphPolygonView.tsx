import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
import useCanvasAgent from "~/lib/useCanvasAgent";
import Dragger from "~/lib/Dragger";
import { clamp } from "~/lib/lodashLike";
import GraphPolygonPlayer from "~/local/GraphPolygonPlayer";
import { TwitterData } from "~/scheme/TwitterData";

export const calcFocusIndex = (list: TwitterData[], scroll: number) =>
  Math.round(scroll * (list.length - 1));

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

const GraphPolygonView = (props: {
  list: TwitterData[];
  twitterName: string;
  onEntry: (ids: string[]) => void;
}) => {
  const { list, twitterName, onEntry } = props;
  const [scroll, setScroll] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { playerRef } = useCanvasAgent({
    initializer: () => new GraphPolygonPlayer(),
    wrapperRef
  });

  const handleScroll = (fn: (s: number) => number) => {
    setScroll(s => clamp(0, 1, fn(s)));
  };

  const scrollBy = (delta: number) => {
    handleScroll(s => s + delta);
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
    const focusIndex = calcFocusIndex(list, scroll);
    const focusItem = list[focusIndex];
    if (focusItem) {
      onEntry(focusItem.recentTweets);
    }
  }, [onEntry, scroll]);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setTwitterName(twitterName);
    }
  }, [twitterName]);

  useEffect(() => {
    const { current: player } = playerRef;
    if (player) {
      player.setScroll(scroll);
    }
  }, [scroll]);

  return <div css={canvasStyle} ref={wrapperRef} />;
};

export default GraphPolygonView;
