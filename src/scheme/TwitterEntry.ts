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
    updatedAt: Number(src.updatedAt || 0),
    retweetCount: Number(src.retweetCount || 0),
    replyCount: Number(src.replyCount || 0),
    likeCount: Number(src.likeCount || 0),
    quoteCount: Number(src.quoteCount || 0)
  };
};
