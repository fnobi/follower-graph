export type TwitterEntry = {
  id: string;
  text: string;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTwitterEntry = (src: any): TwitterEntry => {
  return {
    id: String(src.id || ""),
    text: String(src.text || ""),
    createdAt: String(src.createdAt || "")
  };
};
