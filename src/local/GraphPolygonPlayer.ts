import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { minBy, maxBy, mix, padLeft, clamp } from "~/lib/lodashLike";
import { TwitterData } from "~/scheme/TwitterData";

const VIEWPORT = 450;
const SIZE_MIN = 100;
const SIZE_MAX = 200;
const DOT_SIZE = 4;
const FONT_SIZE = 40;
const FONT_FAMILY = "'Bebas Neue', cursive";

const makeFont = (size: number) => {
  return `${size}px/${size}px ${FONT_FAMILY}`;
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
      const points = this.list.map(({ followersCount: count }, i) => {
        const r = i / this.list.length;
        const a = Math.PI * 2 * (r - scroll);
        const size = mix(
          SIZE_MIN,
          SIZE_MAX,
          minCount === maxCount
            ? 0.5
            : (count - minCount) / (maxCount - minCount)
        );
        const x = Math.cos(a) * size;
        const y = Math.sin(a) * size;
        return { x, y };
      });
      const focusIndex = Math.round(scroll * (this.list.length - 1));
      const focusItem = this.list[focusIndex];

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

      if (focusItem) {
        const d = new Date(focusItem.createdAt);
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = makeFont(FONT_SIZE);
        ctx.fillText(focusItem.followersCount.toLocaleString(), 0, 0);

        ctx.font = makeFont(FONT_SIZE * 0.3);
        ctx.fillText(
          [
            [d.getFullYear(), d.getMonth() + 1, d.getDate()]
              .map(n => padLeft(n, 2))
              .join("/"),
            [d.getHours(), d.getMinutes()].map(n => padLeft(n, 2)).join(":")
          ].join(" "),
          0,
          FONT_SIZE * 0.6
        );
        if (this.twitterName) {
          ctx.fillText(`@${this.twitterName}`, 0, -FONT_SIZE * 0.75);
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
