import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { em } from "~/lib/cssUtil";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import {
  deleteDoc,
  limit,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { accountDocumentRef, accountLogCollectionRef } from "~/local/database";
import { buttonLinkStyle } from "~/local/commonCss";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";
import LoadingView from "~/components/LoadingView";
import NewAccountForm from "~/components/NewAccountForm";

const GraphPolygonView = dynamic(
  () => import("~/components/GraphPolygonView"),
  { ssr: false }
);

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
    firebaseSignOut(getAuth());
  };

  const clearAccount = () => {
    deleteDoc(accountDocumentRef(myId));
  };

  useEffect(() => {
    return onSnapshot(
      query(
        accountLogCollectionRef(myId),
        limit(100),
        orderBy("createdAt", "desc")
      ),
      snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      }
    );
  }, [myId]);

  useEffect(() => {
    return onSnapshot(accountDocumentRef(myId), snapshot => {
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
        <NewAccountForm myId={myId} />
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
