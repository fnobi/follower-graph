import { atom, useRecoilState } from "recoil";

export type UserInfo = {
  id: string;
};

const meStore = atom<UserInfo | null>({
  key: "meStore",
  default: null
});

export const useMeStore = () => {
  const [user, setUser] = useRecoilState(meStore);
  return { user, setUser };
};
