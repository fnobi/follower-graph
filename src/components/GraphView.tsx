import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { px, vh } from "~/lib/cssUtil";
import { firebaseFirestore } from "~/local/firebaseApp";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";

const GraphCanvasElementView = dynamic(
  () => import("~/components/GraphCanvasElementView"),
  { ssr: false }
);

const spacerStyle = css({
  paddingTop: vh(100),
  height: px(3000)
});

const GraphView = (props: { myId: string }) => {
  const { myId } = props;
  const [twitterName, setTwitterName] = useState("");
  const [list, setList] = useState<TwitterData[]>([]);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handler = () => {
      const el = window.document.scrollingElement;
      if (el) {
        const y = el.scrollTop;
        const val = y / (el.scrollHeight - window.innerHeight);
        setScroll(val);
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

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

  return (
    <>
      <div css={spacerStyle} />
      <GraphCanvasElementView
        list={list}
        twitterName={twitterName}
        scroll={scroll}
      />
    </>
  );
};

export default GraphView;
