import { CanvasPlayer } from "~/lib/useCanvasAgent";
import { TwitterData } from "~/scheme/TwitterData";

const RECT_SIZE = 100;

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
    console.log(this.list);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle / 180) * Math.PI);
    ctx.fillRect(-RECT_SIZE / 2, -RECT_SIZE / 2, RECT_SIZE, RECT_SIZE);
    ctx.restore();
  }

  public update(delta: number) {
    this.angle += delta * 0.1;
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
