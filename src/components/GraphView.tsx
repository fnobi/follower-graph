import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { em, percent } from "~/lib/cssUtil";
import { usersDocumentRef, usersLogCollectionRef } from "~/local/database";
import { firebaseAuth, firebaseFirestore } from "~/local/firebaseApp";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";
import NewAccountForm from "./NewAccountForm";

const GraphCanvasElementView = dynamic(
  () => import("~/components/GraphCanvasElementView"),
  { ssr: false }
);

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100)
});

const footerStyle = css({
  position: "fixed",
  bottom: em(1),
  right: em(1)
});

const GraphView = (props: { myId: string }) => {
  const { myId } = props;
  const [twitterName, setTwitterName] = useState("");
  const [list, setList] = useState<TwitterData[]>([]);

  const signOut = () => {
    firebaseAuth().signOut();
  };

  const clearAccount = () => {
    firebaseFirestore()
      .collection("users")
      .doc(myId)
      .delete();
  };

  useEffect(() => {
    return usersLogCollectionRef(myId)
      .limit(100)
      .orderBy("createdAt", "desc")
      .onSnapshot(snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      });
  }, [myId]);

  useEffect(() => {
    return usersDocumentRef(myId).onSnapshot(snapshot => {
      const d = snapshot.data();
      setTwitterName(d ? d.twitter : "");
    });
  }, [myId]);

  return (
    <div>
      {twitterName ? (
        <GraphCanvasElementView list={list} twitterName={twitterName} />
      ) : (
        <div css={wrapperStyle}>
          <NewAccountForm myId={myId} />
        </div>
      )}
      <div css={footerStyle}>
        {twitterName ? (
          <>
            <button type="button" onClick={clearAccount}>
              clear
            </button>
            &nbsp;
          </>
        ) : null}
        <button type="button" onClick={signOut}>
          logout
        </button>
      </div>
    </div>
  );
};

export default GraphView;
