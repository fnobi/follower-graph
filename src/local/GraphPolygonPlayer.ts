import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { minBy, maxBy, mix, padLeft, clamp } from "~/lib/lodashLike";
import { CUSTOM_FONT_FAMILY } from "~/local/commonCss";
import { TwitterData } from "~/scheme/TwitterData";

const VIEWPORT = 450;
const SIZE_MIN = 100;
const SIZE_MAX = 200;
const DOT_SIZE = 4;
const FONT_SIZE = 45;
const VERTICAL_GRAPH_UNIT = 10;
const STATIC_GRAPH_OFFSET_Y = 300;

const makeFont = (size: number) => {
  return `${size}px/${size}px ${CUSTOM_FONT_FAMILY}`;
};

export default class GraphPolygonPlayer implements CanvasPlayer {
  public readonly canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D | null;

  private scroll = 0;

  private scale = 0;

  private list: TwitterData[] = [];

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

  public setScroll(num: number) {
    this.scroll = clamp(0, 1, num);
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
      const scrollLength = (this.list.length - 1) * VERTICAL_GRAPH_UNIT;
      const scrollOffset = scrollLength * scroll;
      const vw = canvas.width / this.scale;
      const cc = this.list.length - 1;
      const mc = this.list.length + 1;
      const staticGraphRight = (0.5 - 1 / mc) * vw;
      const staticGraphLength = (vw / mc) * cc;

      const points1 = this.list.map(({ followersCount: count }, i) => {
        const size = mix(
          SIZE_MAX,
          SIZE_MIN,
          minCount === maxCount
            ? 0.5
            : (count - minCount) / (maxCount - minCount)
        );
        const x = -i * VERTICAL_GRAPH_UNIT + scrollOffset;
        const y = size;
        return { x, y };
      });
      const points2 = this.list.map(({ followersCount: count }, i) => {
        const size = mix(
          SIZE_MAX,
          SIZE_MIN,
          minCount === maxCount
            ? 0.5
            : (count - minCount) / (maxCount - minCount)
        );
        const x = staticGraphRight - (vw / mc) * i;
        const y = size - STATIC_GRAPH_OFFSET_Y;
        return { x, y };
      });
      const focusIndex = Math.round(scroll * (this.list.length - 1));
      const focusItem = this.list[focusIndex];

      ctx.save();
      ctx.fillStyle = "#888";
      ctx.fillRect(
        -scrollLength + scrollOffset,
        SIZE_MIN,
        scrollLength,
        SIZE_MAX - SIZE_MIN
      );
      ctx.fillRect(
        staticGraphRight - staticGraphLength * scroll,
        SIZE_MIN - STATIC_GRAPH_OFFSET_Y,
        20,
        SIZE_MAX - SIZE_MIN
      );
      ctx.restore();

      [points1, points2].forEach(points => {
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
            if (i === focusIndex || i === 0 || i === this.list.length - 1) {
              ctx.save();
              ctx.fillStyle = i === focusIndex ? "#fff" : "#003";
              ctx.beginPath();
              ctx.arc(x, y, DOT_SIZE, 0, Math.PI * 2);
              ctx.fill();
              if (i !== focusIndex) {
                ctx.stroke();
              }
              ctx.restore();
            }
          });
        }
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
