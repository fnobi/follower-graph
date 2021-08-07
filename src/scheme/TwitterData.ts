export type TwitterData = {
  createdAt: number;
  followersCount: number;
  friendsCount: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseTwitterData = (src: any): TwitterData => {
  return {
    createdAt: Number(src.createdAt || 0),
    followersCount: Number(src.followersCount || 0),
    friendsCount: Number(src.friendsCount || 0)
  };
};
