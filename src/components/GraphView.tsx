import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { firebaseFirestore } from "~/local/firebaseApp";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";

const GraphCanvasElementView = dynamic(
  () => import("~/components/GraphCanvasElementView"),
  { ssr: false }
);

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

  return <GraphCanvasElementView list={list} />;
};

export default GraphView;
