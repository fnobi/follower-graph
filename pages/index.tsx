import { useState, useEffect } from "react";
import { css } from "@emotion/react";
import { px, percent } from "~/lib/cssUtil";
import { firebaseFirestore } from "~/local/firebaseApp";

type TwitterData = {
  createdAt: number;
  followersCount: number;
  friendsCount: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseTwitterData = (src: any): TwitterData => {
  return {
    createdAt: Number(src.createdAt || 0),
    followersCount: Number(src.followersCount || 0),
    friendsCount: Number(src.friendsCount || 0)
  };
};

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: px(0),
  left: px(0),
  width: percent(100),
  height: percent(100)
});

const PageIndex = () => {
  const [list, setList] = useState<TwitterData[]>([]);

  useEffect(() => {
    firebaseFirestore()
      .collection("fnobi")
      .limit(100)
      .orderBy("createdAt", "desc")
      .onSnapshot(snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      });
  }, []);

  return (
    <div css={wrapperStyle}>
      {list.map(item => (
        <p key={item.createdAt}>
          {new Date(item.createdAt).toString()}
          <br />
          {item.followersCount}
        </p>
      ))}
    </div>
  );
};

export default PageIndex;
