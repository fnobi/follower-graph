import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { minBy, maxBy, mix } from "~/lib/lodashLike";
import { TwitterData } from "~/scheme/TwitterData";

export default class GraphCanvasElementPlayer implements CanvasPlayer {
  public readonly canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D | null;

  private angle = 0;

  private list: TwitterData[] = [];

  public constructor() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public setList(list: TwitterData[]) {
    this.list = list;
  }

  private render() {
    const { ctx, canvas, angle } = this;
    if (!ctx || !canvas) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    if (this.list.length) {
      const SIZE_MIN = 100;
      const SIZE_MAX = 200;
      const DOT_SIZE = 5;

      const min = minBy(this.list, item => item.followersCount);
      const max = maxBy(this.list, item => item.followersCount);
      const points = this.list.map((item, i) => {
        const r = i / this.list.length;
        const offset = angle / 180;
        const a = Math.PI * 2 * (r + offset);
        const size = mix(
          SIZE_MIN,
          SIZE_MAX,
          (item.followersCount - min.followersCount) /
            (max.followersCount - min.followersCount)
        );
        const x = Math.cos(a) * size;
        const y = Math.sin(a) * size;
        return { x, y };
      });

      ctx.beginPath();
      points.forEach(({ x, y }, i) => {
        if (i) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
        }
      });
      ctx.stroke();

      ctx.beginPath();
      points.forEach(({ x, y }) => {
        ctx.moveTo(x, y);
        ctx.arc(x, y, DOT_SIZE, 0, Math.PI * 2);
      });
      ctx.fill();
    }
    ctx.restore();
  }

  public update(delta: number) {
    this.angle += delta * 0.02;
    this.render();
  }

  public resize() {
    const { canvas } = this;
    const resolution = window.devicePixelRatio;
    canvas.width = canvas.offsetWidth * resolution;
    canvas.height = canvas.offsetHeight * resolution;
    this.render();
  }

  // eslint-disable-next-line class-methods-use-this
  public dispose() {
    /* do nothing */
  }
}
