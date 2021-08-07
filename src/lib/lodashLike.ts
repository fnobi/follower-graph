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
