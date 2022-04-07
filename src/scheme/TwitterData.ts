export type TwitterData = {
  createdAt: number;
  followersCount: number;
  friendsCount: number;
  hours: number;
  days: number;
  recentTweets: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseStringArray = (src: any): string[] => {
  const data = src || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((s: any) => String(s || ""));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTwitterData = (src: any): TwitterData => {
  return {
    createdAt: Number(src.createdAt || 0),
    followersCount: Number(src.followersCount || 0),
    friendsCount: Number(src.friendsCount || 0),
    hours: Number(src.hours || 0),
    days: Number(src.days || 0),
    recentTweets: parseStringArray(src.recentTweets)
  };
};
