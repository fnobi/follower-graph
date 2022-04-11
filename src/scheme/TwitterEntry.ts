export type TwitterEntry = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: number;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTwitterEntry = (src: any): TwitterEntry => {
  return {
    id: String(src.id || ""),
    text: String(src.text || ""),
    createdAt: String(src.createdAt || ""),
    updatedAt: Number(src.updatedAt),
    retweetCount: Number(src.retweetCount),
    replyCount: Number(src.replyCount),
    likeCount: Number(src.likeCount),
    quoteCount: Number(src.quoteCount)
  };
};
