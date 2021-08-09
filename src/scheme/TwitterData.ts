export type TwitterData = {
  createdAt: number;
  followersCount: number;
  friendsCount: number;
  hours: number;
  days: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTwitterData = (src: any): TwitterData => {
  return {
    createdAt: Number(src.createdAt || 0),
    followersCount: Number(src.followersCount || 0),
    friendsCount: Number(src.friendsCount || 0),
    hours: Number(src.hours || 0),
    days: Number(src.days || 0)
  };
};
