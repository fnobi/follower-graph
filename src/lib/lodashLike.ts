export function minBy<T>(arr: T[], fn: (item: T) => number): T {
  const [head, ...rest] = arr;
  const comp = rest.shift();
  if (!comp) {
    return head;
  }
  return minBy([fn(head) < fn(comp) ? head : comp, ...rest], fn);
}

export function maxBy<T>(arr: T[], fn: (item: T) => number): T {
  const [head, ...rest] = arr;
  const comp = rest.shift();
  if (!comp) {
    return head;
  }
  return maxBy([fn(head) > fn(comp) ? head : comp, ...rest], fn);
}

export function mix(a: number, b: number, p: number) {
  return a + (b - a) * p;
}

export function clamp(mi: number, ma: number, v: number) {
  return Math.max(mi, Math.min(ma, v));
}

export function padLeft(num: number, length: number, glue: string = "0") {
  const l = Math.max(length, String(num).length);
  return (new Array(l).join(glue) + num).slice(-l);
}

export function sumBy<T>(array: T[], handler: (item: T) => number): number {
  return array.reduce((prev, item) => prev + handler(item), 0);
}

export function sum(array: number[]): number {
  return sumBy(array, n => n);
}
