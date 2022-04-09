import { padLeft } from "~/lib/lodashLike";

// eslint-disable-next-line import/prefer-default-export
export const formatDateTime = (d: Date) =>
  [
    [d.getFullYear(), d.getMonth() + 1, d.getDate()]
      .map(n => padLeft(n, 2))
      .join("/"),
    [d.getHours(), d.getMinutes()].map(n => padLeft(n, 2)).join(":")
  ].join(" ");
