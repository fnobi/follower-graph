import { useEffect, useRef } from "react";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
import useCanvasAgent from "~/lib/useCanvasAgent";
import Dragger from "~/lib/Dragger";
import GraphPolygonPlayer from "~/local/GraphPolygonPlayer";
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

const GraphPolygonView = (props: {
  list: TwitterData[];
  twitterName: string;
}) => {
  const { list, twitterName } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { playerRef } = useCanvasAgent({
    initializer: () => new GraphPolygonPlayer(),
    wrapperRef
  });

  useEffect(() => {
    const { current: wrapper } = wrapperRef;
    if (!wrapper) {
      return () => {};
    }
    const dragger = new Dragger({
      els: [wrapper],
      onMove: ({ x, y }) => {
        const { current: player } = playerRef;
        if (player) {
          player.scrollBy((-y + x) * 0.0002);
        }
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
      player.setTwitterName(twitterName);
    }
  }, [twitterName]);

  return <div css={canvasStyle} ref={wrapperRef} />;
};

export default GraphPolygonView;
