export type TwitterAccount = {
  owner: string;
  isTracking: boolean;
  name: string;
  iconUrl: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTwitterAccount = (src: any): TwitterAccount => {
  return {
    owner: String(src.owner || ""),
    isTracking: !!src.isTracking,
    name: String(src.name || ""),
    iconUrl: String(src.iconUrl || "")
  };
};
