import { sumBy } from "~/lib/lodashLike";

type Vector3 = { x: number; y: number; z: number };

type InteractionEvent = {
  touchstart: (e: TouchEvent) => void;
  touchmove: (e: TouchEvent) => void;
  touchend: () => void;
  mousedown: (e: MouseEvent) => void;
  mousemove: (e: MouseEvent) => void;
  mouseup: () => void;
  mouseleave: () => void;
  wheel: (e: WheelEvent) => void;
  keydown: (e: KeyboardEvent) => void;
};

const PHYSICS_DECLEACE = 0.95;
const PHYSICS_SLICE = 2;
const PHYSICS_SCALE = 4.0;
const MIN_POWER = 0.1;
const KEY_UNIT = 20;

function extractTouch(e: TouchEvent): { x: number; y: number }[] {
  const { touches } = e;
  return Array.from(touches).map(touch => ({ x: touch.pageX, y: touch.pageY }));
}

function extractMouse(e: MouseEvent): { x: number; y: number }[] {
  const { pageX, pageY } = e;
  return [{ x: pageX, y: pageY }];
}

function fingerAverage(posArray: { x: number; y: number }[]) {
  return {
    x: sumBy(posArray, item => item.x) / posArray.length,
    y: sumBy(posArray, item => item.y) / posArray.length
  };
}

function fingerDistance(posArray: { x: number; y: number }[]) {
  const [first, second] = posArray;
  if (!first || !second) {
    return 0;
  }
  return ((first.x - second.x) ** 2 + (first.y - second.y) ** 2) ** 0.5;
}

function scalarToVector(base: number = 0) {
  return {
    x: base,
    y: base,
    z: base
  };
}

function vectorAdd(a: Vector3, b: Vector3) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

function vectorMultiply(a: Vector3, b: Vector3) {
  return {
    x: a.x * b.x,
    y: a.y * b.y,
    z: a.z * b.z
  };
}

function vectorMultiplyScalar(a: Vector3, b: number) {
  return vectorMultiply(a, scalarToVector(b));
}

export default class Dragger {
  public isMove: boolean = false;

  private els: HTMLElement[];

  private onMove: (delta: Vector3, center: { x: number; y: number }) => void;

  private prev: { x: number; y: number }[] | null = null;

  private log: { delta: Vector3; time: number }[] = [];

  private speed: Vector3 = scalarToVector();

  private center: { x: number; y: number } = { x: 0, y: 0 };

  private timer = -1;

  private isLocked = false;

  private listeners: InteractionEvent;

  public constructor(opts: {
    els: HTMLElement[];
    onMove: (delta: Vector3, center: { x: number; y: number }) => void;
    wheelHandler?: (e: WheelEvent) => Vector3;
    preventDefault?: boolean;
    keyboardFlag?: boolean;
  }) {
    const {
      els,
      onMove,
      wheelHandler = (e: WheelEvent) => ({ x: 0, y: 0, z: e.deltaY }),
      preventDefault = false,
      keyboardFlag = true
    } = opts;
    this.els = els;
    this.onMove = onMove;

    this.listeners = {
      touchstart: (e: TouchEvent) => {
        if (preventDefault) {
          e.preventDefault();
        }
        this.handleStart(extractTouch(e));
      },
      touchmove: (e: TouchEvent) => {
        if (preventDefault) {
          e.preventDefault();
        }
        this.handleMove(extractTouch(e));
      },
      touchend: () => this.handleEnd(),
      mousedown: (e: MouseEvent) => this.handleStart(extractMouse(e)),
      mousemove: (e: MouseEvent) => this.handleMove(extractMouse(e)),
      mouseup: () => this.handleEnd(),
      mouseleave: () => this.handleEnd(),
      wheel: (e: WheelEvent) => {
        e.preventDefault();
        this.onMove(wheelHandler(e), this.center);
      },
      keydown: keyboardFlag
        ? (e: KeyboardEvent) => {
            this.handleKeyboard(e.code);
          }
        : () => {}
    };

    this.setListeners();

    const handler = () => {
      this.timer = window.requestAnimationFrame(handler);
      if (
        Math.sqrt(sumBy(Object.values(this.speed), n => n ** 2)) > MIN_POWER
      ) {
        this.onMove(this.speed, this.center);
        this.speed = vectorMultiplyScalar(this.speed, PHYSICS_DECLEACE);
      }
    };
    this.timer = window.requestAnimationFrame(handler);
  }

  public setIsLock(flag: boolean) {
    if (flag) {
      this.handleEnd();
      this.speed = scalarToVector();
    }
    this.isLocked = flag;
  }

  private calcSpeed() {
    const log = this.log.slice(-PHYSICS_SLICE);
    if (!log.length) {
      this.speed = scalarToVector();
      return;
    }
    const sum = log.reduce(
      (prev, current) => vectorAdd(current.delta, prev),
      scalarToVector()
    );
    const timeData = log.reduce(
      (prev, current) => ({
        min: Math.min(prev.min, current.time),
        max: Math.max(prev.max, current.time)
      }),
      { min: Infinity, max: 0 }
    );
    const duration = timeData.max - timeData.min;
    this.speed = vectorMultiplyScalar(
      sum,
      duration ? PHYSICS_SCALE / duration : 0
    );
    this.log = [];
  }

  private setListeners() {
    this.els.forEach(el => {
      el.addEventListener("touchstart", this.listeners.touchstart);
      el.addEventListener("touchmove", this.listeners.touchmove);
      el.addEventListener("touchend", this.listeners.touchend);
      el.addEventListener("mousedown", this.listeners.mousedown);
      el.addEventListener("mousemove", this.listeners.mousemove);
      el.addEventListener("mouseup", this.listeners.mouseup);
      el.addEventListener("mouseleave", this.listeners.mouseleave);
      el.addEventListener("wheel", this.listeners.wheel);
    });
    window.addEventListener("keydown", this.listeners.keydown);
  }

  private unsetListeners() {
    this.els.forEach(el => {
      el.removeEventListener("touchstart", this.listeners.touchstart);
      el.removeEventListener("touchmove", this.listeners.touchmove);
      el.removeEventListener("touchend", this.listeners.touchend);
      el.removeEventListener("mousedown", this.listeners.mousedown);
      el.removeEventListener("mousemove", this.listeners.mousemove);
      el.removeEventListener("mouseup", this.listeners.mouseup);
      el.removeEventListener("mouseleave", this.listeners.mouseleave);
      el.removeEventListener("wheel", this.listeners.wheel);
    });
    window.removeEventListener("keydown", this.listeners.keydown);
  }

  private handleStart(pos: { x: number; y: number }[]) {
    if (this.isLocked) {
      return;
    }
    this.isMove = false;
    this.prev = pos;
  }

  private checkSamePos(pos: { x: number; y: number }[]) {
    let isSame = true;
    (this.prev || []).forEach((p, i) => {
      isSame = isSame && fingerDistance([pos[i], p]) < 2;
    });
    return isSame;
  }

  private handleMove(pos: { x: number; y: number }[]) {
    if (!this.prev) {
      return;
    }
    if (this.checkSamePos(pos)) {
      return;
    }
    this.isMove = true;
    const prevPointer = fingerAverage(this.prev);
    const currentPointer = fingerAverage(pos);
    const pointerDelta: [number, number] = [
      currentPointer.x - prevPointer.x,
      currentPointer.y - prevPointer.y
    ];
    const prevDistance = fingerDistance(this.prev);
    const currentDistance = fingerDistance(pos);
    const distanceDelta = currentDistance - prevDistance;
    this.center = currentPointer;
    const delta = { x: pointerDelta[0], y: pointerDelta[1], z: distanceDelta };
    this.onMove(delta, this.center);
    this.log.push({
      delta,
      time: Date.now()
    });
    this.speed = scalarToVector();
    this.prev = pos;
  }

  private handleEnd() {
    this.prev = null;
    this.calcSpeed();
  }

  private handleKeyboard(code: string) {
    switch (code) {
      case "ArrowUp":
        this.speed = vectorAdd(this.speed, { x: 0, y: KEY_UNIT, z: 0 });
        break;
      case "ArrowDown":
        this.speed = vectorAdd(this.speed, { x: 0, y: -KEY_UNIT, z: 0 });
        break;
      case "ArrowRight":
        this.speed = vectorAdd(this.speed, {
          x: -KEY_UNIT,
          y: 0,
          z: 0
        });
        break;
      case "ArrowLeft":
        this.speed = vectorAdd(this.speed, {
          x: KEY_UNIT,
          y: 0,
          z: 0
        });
        break;
      default:
        break;
    }
  }

  public destroy() {
    this.unsetListeners();
    window.cancelAnimationFrame(this.timer);
  }
}
