import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { em, percent } from "~/lib/cssUtil";
import { accountDocumentRef, accountLogCollectionRef } from "~/local/database";
import { firebaseAuth } from "~/local/firebaseApp";
import { buttonLinkStyle } from "~/local/commonCss";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";
import LoadingView from "~/components/LoadingView";
import NewAccountForm from "~/components/NewAccountForm";

const GraphPolygonView = dynamic(
  () => import("~/components/GraphPolygonView"),
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

const ProfileView = (props: { myId: string }) => {
  const { myId } = props;
  const [account, setAccount] = useState<{ twitter: string } | null>(null);
  const [list, setList] = useState<TwitterData[] | null>(null);

  const signOut = () => {
    firebaseAuth().signOut();
  };

  const clearAccount = () => {
    accountDocumentRef(myId).delete();
  };

  useEffect(() => {
    return accountLogCollectionRef(myId)
      .limit(100)
      .orderBy("createdAt", "desc")
      .onSnapshot(snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      });
  }, [myId]);

  useEffect(() => {
    return accountDocumentRef(myId).onSnapshot(snapshot => {
      const d = snapshot.data();
      setAccount({ twitter: d ? d.twitter : "" });
    });
  }, [myId]);

  if (!list || !account) {
    return <LoadingView />;
  }

  return (
    <div>
      {account.twitter ? (
        <GraphPolygonView list={list} twitterName={account.twitter} />
      ) : (
        <div css={wrapperStyle}>
          <NewAccountForm myId={myId} />
        </div>
      )}
      <div css={footerStyle}>
        {account.twitter ? (
          <>
            <button type="button" onClick={clearAccount} css={buttonLinkStyle}>
              clear
            </button>
            &nbsp;
          </>
        ) : null}
        <button type="button" onClick={signOut} css={buttonLinkStyle}>
          logout
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
