import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { minBy, maxBy, mix } from "~/lib/lodashLike";
import { TwitterData } from "~/scheme/TwitterData";
import { calcFocusIndex } from "~/components/GraphPolygonView";

const VIEWPORT = 450;
const DOT_SIZE = 4;
const GRAPH_HEIGHT = 160;
const GRAPH_UNIT = 10;
const GRAPH_OFFSET_Y = -100;
const SCROLL_BAR_OFFSET_Y = -200;
const SCROLL_BAR_HEIGHT = 4;

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
      const scrollLength = (this.list.length - 1) * GRAPH_UNIT;
      const scrollOffset = scrollLength * scroll;
      const vw = canvas.width / this.scale;
      const vh = canvas.height / this.scale;
      const cc = this.list.length - 1;
      const mc = this.list.length + 1;
      const staticGraphRight = (0.5 - 1 / mc) * vw;
      const staticGraphLength = (vw / mc) * cc;
      const highlightWidth = (staticGraphLength * vw) / scrollLength;
      const yUnit = calcYUnit(maxCount - minCount);
      const yAxisStart = Math.ceil(minCount / yUnit) * yUnit;
      const yLineCount = Math.ceil((maxCount - yAxisStart) / yUnit);
      const yAxises = new Array(yLineCount)
        .fill(0)
        .map((z, i) => yAxisStart + i * yUnit);

      const ys = this.list.map(({ followersCount: count }) =>
        minCount === maxCount ? 0.5 : (count - minCount) / (maxCount - minCount)
      );
      const points = ys.map((y, i) => ({
        x: -i * GRAPH_UNIT + scrollOffset,
        y
      }));
      const focusIndex = calcFocusIndex(this.list, scroll);
      const highlightstart =
        staticGraphRight - staticGraphLength * scroll - highlightWidth / 2;

      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#fff";
      ctx.fillRect(
        highlightstart,
        SCROLL_BAR_OFFSET_Y - SCROLL_BAR_HEIGHT * 0.5,
        highlightWidth,
        SCROLL_BAR_HEIGHT
      );
      ctx.restore();

      const scaledPoints = points.map(({ x, y }) => ({
        x,
        y: mix(GRAPH_HEIGHT, 0, y) - GRAPH_HEIGHT * 0.5
      }));

      ctx.save();
      ctx.translate(0, GRAPH_OFFSET_Y);

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      yAxises
        .map(v =>
          mix(
            GRAPH_HEIGHT / 2,
            -GRAPH_HEIGHT / 2,
            minCount === maxCount ? 0.5 : (v - minCount) / (maxCount - minCount)
          )
        )
        .forEach(y => {
          ctx.moveTo(-vw / 2, y);
          ctx.lineTo(vw / 2, y);
        });
      ctx.stroke();
      ctx.restore();

      if (scaledPoints.length > 1) {
        scaledPoints.forEach(({ x, y }, i) => {
          const isFocus = i === focusIndex;
          if (isFocus) {
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#00f";
            ctx.beginPath();
            ctx.arc(x, y, DOT_SIZE * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.moveTo(x, -vh / 2 - GRAPH_OFFSET_Y);
            ctx.lineTo(x, vh / 2 - GRAPH_OFFSET_Y);
            ctx.stroke();
            ctx.restore();
          }
        });
        ctx.beginPath();
        scaledPoints.forEach(({ x, y }, i) => {
          if (i) {
            ctx.lineTo(x, y);
          } else {
            ctx.moveTo(x, y);
          }
        });
        ctx.stroke();

        scaledPoints.forEach(({ x, y }, i) => {
          const isEdge = i === 0 || i === this.list.length - 1;
          const isEntrySpot = this.entryIndexes.includes(i);
          if (isEntrySpot) {
            const markWidth = 8;
            const markHeight = 6;
            const yOffset = -8;
            ctx.save();
            ctx.fillStyle = "#0ff";
            ctx.beginPath();
            ctx.moveTo(x, y + yOffset);
            ctx.lineTo(x - markWidth / 2, y - markHeight + yOffset);
            ctx.lineTo(x + markWidth / 2, y - markHeight + yOffset);
            ctx.lineTo(x, y + yOffset);
            ctx.fill();
            ctx.restore();
          }
          if (isEdge) {
            ctx.save();
            ctx.fillStyle = "#003";
            ctx.beginPath();
            ctx.arc(x, y, DOT_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        });
      }
      ctx.restore();
    }
    ctx.restore();
  }

  public update() {
    this.render();
  }

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
