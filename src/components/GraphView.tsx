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
  const [twitterName, setTwitterName] = useState("");
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

  useEffect(() => {
    return firebaseFirestore()
      .collection("users")
      .doc(myId)
      .onSnapshot(snapshot => {
        const d = snapshot.data();
        setTwitterName(d ? d.twitter : "");
      });
  }, [myId]);

  return <GraphCanvasElementView list={list} twitterName={twitterName} />;
};

export default GraphView;
