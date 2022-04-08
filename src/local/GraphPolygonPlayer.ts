import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { minBy, maxBy, mix, padLeft } from "~/lib/lodashLike";
import { px } from "~/lib/cssUtil";
import { CUSTOM_FONT_FAMILY } from "~/local/commonCss";
import { TwitterData } from "~/scheme/TwitterData";
import { calcFocusIndex } from "~/components/GraphPolygonView";

const VIEWPORT = 450;
const GRAPH_HEIGHT = 80;
const DOT_SIZE = 4;
const FONT_SIZE = 45;
const HIGHLIGHT_PADDING = 10;
const SCROLL_GRAPH_UNIT = 10;
const SCROLL_GRAPH_OFFSET_Y = 120;
const STATIC_GRAPH_OFFSET_Y = -120;

const makeFont = (size: number) =>
  [[px(size), px(size)].join("/"), CUSTOM_FONT_FAMILY].join(" ");

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

  private twitterName: string = "";

  public constructor() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public setList(list: TwitterData[]) {
    this.list = list;
  }

  public setTwitterName(twitterName: string) {
    this.twitterName = twitterName;
  }

  public setEntryIndexes(is: number[]) {
    this.entryIndexes = [...is];
  }

  public setScroll(num: number) {
    this.scroll = num;
  }

  public scrollBy(delta: number) {
    this.setScroll(this.scroll + delta);
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
      const scrollLength = (this.list.length - 1) * SCROLL_GRAPH_UNIT;
      const scrollOffset = scrollLength * scroll;
      const vw = canvas.width / this.scale;
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
      const points1 = ys.map((y, i) => ({
        x: -i * SCROLL_GRAPH_UNIT + scrollOffset,
        y: mix(GRAPH_HEIGHT, 0, y) - GRAPH_HEIGHT * 0.5
      }));
      const points2 = ys.map((y, i) => ({
        x: staticGraphRight - (vw / mc) * i,
        y: mix(GRAPH_HEIGHT, 0, y) - GRAPH_HEIGHT * 0.5
      }));
      const focusIndex = calcFocusIndex(this.list, scroll);
      const focusItem = this.list[focusIndex];

      [
        {
          points: points1,
          offsetY: SCROLL_GRAPH_OFFSET_Y,
          rangeStart: -vw / 2,
          rangeWidth: vw
        },
        {
          points: points2,
          offsetY: STATIC_GRAPH_OFFSET_Y,
          rangeStart:
            staticGraphRight - staticGraphLength * scroll - highlightWidth / 2,
          rangeWidth: highlightWidth
        }
      ].forEach(({ points, offsetY, rangeStart, rangeWidth }) => {
        ctx.save();
        ctx.translate(0, offsetY);

        ctx.save();
        ctx.fillStyle = "#008";
        ctx.fillRect(
          rangeStart,
          -GRAPH_HEIGHT * 0.5 - HIGHLIGHT_PADDING,
          rangeWidth,
          GRAPH_HEIGHT + HIGHLIGHT_PADDING * 2
        );
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        yAxises
          .map(v =>
            mix(
              GRAPH_HEIGHT / 2,
              -GRAPH_HEIGHT / 2,
              minCount === maxCount
                ? 0.5
                : (v - minCount) / (maxCount - minCount)
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
            const isEdge = i === 0 || i === this.list.length - 1;
            const isFocus = i === focusIndex;
            const isEntrySpot = this.entryIndexes.includes(i);
            if (isFocus || isEdge || isEntrySpot) {
              ctx.save();
              ctx.fillStyle = isFocus ? "#fff" : "#003";
              if (isEntrySpot) {
                ctx.fillStyle = "#0f0";
              }
              const dotSize = isFocus || !isEntrySpot ? DOT_SIZE : DOT_SIZE / 2;
              ctx.beginPath();
              ctx.arc(x, y, dotSize, 0, Math.PI * 2);
              ctx.fill();
              if (isEdge) {
                ctx.stroke();
              }
              ctx.restore();
            }
          });
        }
        ctx.restore();
      });

      if (focusItem) {
        const d = new Date(focusItem.createdAt);
        const dateString = [
          [d.getFullYear(), d.getMonth() + 1, d.getDate()]
            .map(n => padLeft(n, 2))
            .join("/"),
          [d.getHours(), d.getMinutes()].map(n => padLeft(n, 2)).join(":")
        ].join(" ");

        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = makeFont(FONT_SIZE);
        ctx.fillText(focusItem.followersCount.toLocaleString(), 0, 0);

        ctx.font = makeFont(FONT_SIZE * 0.5);
        ctx.fillText(dateString, 0, FONT_SIZE * 1);
        if (this.twitterName) {
          ctx.fillText(`@${this.twitterName}`, 0, -FONT_SIZE * 1.1);
        }
        ctx.restore();
      }
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
