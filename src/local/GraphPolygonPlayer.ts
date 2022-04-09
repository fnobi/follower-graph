import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { minBy, maxBy, mix } from "~/lib/lodashLike";
import { TwitterData } from "~/scheme/TwitterData";
import { calcFocusIndex } from "~/components/GraphPolygonView";

const VIEWPORT = 450;
const DOT_SIZE = 5;
const EDGE_DOT_SIZE = 8;
const GRAPH_PADDING = 20;

const calcYUnit = (diff: number) => {
  let p = 3;
  while (10 ** p < diff) {
    p += 1;
  }
  return 10 ** (p - 1);
};

export default class GraphPolygonPlayer implements CanvasPlayer {
  public readonly canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D | null;

  private scroll = 0;

  private scale = 0;

  private list: TwitterData[] = [];

  private entryIndexes: number[] = [];

  public constructor() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public setList(list: TwitterData[]) {
    this.list = [...list];
  }

  public setEntryIndexes(is: number[]) {
    this.entryIndexes = [...is];
  }

  public setScroll(num: number) {
    this.scroll = num;
    this.render();
  }

  private render() {
    const { ctx, canvas, scroll } = this;
    if (!ctx || !canvas) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.strokeStyle = "#fff";

    if (this.list.length) {
      const { followersCount: minCount } = minBy(
        this.list,
        item => item.followersCount
      );
      const { followersCount: maxCount } = maxBy(
        this.list,
        item => item.followersCount
      );

      const vw = canvas.width / this.scale;
      const vh = canvas.height / this.scale;
      const graphHeight = vh - GRAPH_PADDING * 2;
      const graphUnit = graphHeight / 30;

      const scrollLength = (this.list.length - 1) * graphUnit;
      const scrollOffset = scrollLength * scroll;
      const yUnit = calcYUnit(maxCount - minCount);
      const yAxisStart = Math.ceil(minCount / yUnit) * yUnit;
      const yLineCount = Math.ceil((maxCount - yAxisStart) / yUnit);
      const yAxises = new Array(yLineCount)
        .fill(0)
        .map((z, i) => yAxisStart + i * yUnit);
      const points = this.list
        .map(({ followersCount: count }) =>
          minCount === maxCount
            ? 0.5
            : (count - minCount) / (maxCount - minCount)
        )
        .map((y, i) => ({
          x: -i * graphUnit + scrollOffset,
          y: mix(graphHeight, 0, y) - graphHeight * 0.5
        }));
      const focusIndex = calcFocusIndex(this.list, scroll);

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      yAxises
        .map(v =>
          mix(
            graphHeight / 2,
            -graphHeight / 2,
            minCount === maxCount ? 0.5 : (v - minCount) / (maxCount - minCount)
          )
        )
        .forEach(y => {
          ctx.moveTo(-vw / 2, y);
          ctx.lineTo(vw / 2, y);
        });
      ctx.stroke();
      ctx.restore();

      if (points.length > 1) {
        ctx.beginPath();
        points.forEach(({ x, y }, i) => {
          if (i) {
            ctx.lineTo(x, y);
          } else {
            ctx.moveTo(x, y);
          }
        });
        ctx.stroke();

        points.forEach(({ x, y }, i) => {
          const isFocus = i === focusIndex;
          const isEdge = i === 0 || i === this.list.length - 1;
          const isEntrySpot = this.entryIndexes.includes(i);
          if (isEntrySpot) {
            ctx.save();
            ctx.fillStyle = "#003";
            ctx.beginPath();
            ctx.arc(x, y, DOT_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
          if (isFocus) {
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(x, y, DOT_SIZE - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (isEdge) {
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.fillRect(
              x - EDGE_DOT_SIZE * 0.5,
              y - EDGE_DOT_SIZE * 0.5,
              EDGE_DOT_SIZE,
              EDGE_DOT_SIZE
            );
            ctx.restore();
          }
        });
      }
    }
    ctx.restore();
  }

  // eslint-disable-next-line class-methods-use-this
  public update() {}

  public resize() {
    const { canvas } = this;
    const resolution = window.devicePixelRatio;
    canvas.width = canvas.offsetWidth * resolution;
    canvas.height = canvas.offsetHeight * resolution;
    this.scale = Math.min(canvas.width, canvas.height) / VIEWPORT;
    this.render();
  }

  // eslint-disable-next-line class-methods-use-this
  public dispose() {
    /* do nothing */
  }
}
