import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { css } from "@emotion/react";
import { firebaseFirestore } from "~/local/firebaseApp";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";

const SampleCanvasElementView = dynamic(
  () => import("~/components/SampleCanvasElementView"),
  { ssr: false }
);

const wrapperStyle = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  color: "#f00",
  textAlign: "center"
});

const GraphTableRow = (props: { item: TwitterData }) => {
  const { item } = props;
  const dateString = useMemo(() => {
    const d = new Date(item.createdAt);
    return [
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("-"),
      [d.getHours(), d.getMinutes()].join(":")
    ].join(" ");
  }, [item.createdAt]);
  return (
    <p>
      {dateString}&nbsp;[{item.followersCount}]
    </p>
  );
};

const GraphView = (props: { myId: string }) => {
  const { myId } = props;
  const [list, setList] = useState<TwitterData[]>([]);

  useEffect(() => {
    return firebaseFirestore()
      .collection("users")
      .doc(myId)
      .collection("log")
      .limit(100)
      .orderBy("createdAt", "desc")
      .onSnapshot(snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      });
  }, [myId]);

  return (
    <>
      <SampleCanvasElementView />
      <div css={wrapperStyle}>
        {list.map(item => (
          <GraphTableRow key={item.createdAt} item={item} />
        ))}
      </div>
    </>
  );
};

export default GraphView;
