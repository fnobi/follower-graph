import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { em, px } from "~/lib/cssUtil";
import { getAuth, signOut } from "firebase/auth";
import {
  deleteDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { accountDocumentRef, accountLogCollectionRef } from "~/local/database";
import { buttonLinkStyle, buttonReset } from "~/local/commonCss";
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

const filterSelectStyle = css(buttonReset, {
  border: `solid ${px(1)} #fff`,
  padding: em(0, 0.5),
  boxShadow: `${px(1)} ${px(2)} ${px(0)} #fff`,
  transform: `translate(${px(-1)},${px(-2)})`
});

const ProfileView = (props: { myId: string }) => {
  const { myId } = props;
  const [account, setAccount] = useState<{ twitter: string } | null>(null);
  const [list, setList] = useState<TwitterData[] | null>(null);
  const [filter, setFilter] = useState<"hours" | "days" | "monthes">("hours");

  const handleLogout = () => {
    signOut(getAuth());
  };

  const clearAccount = () => {
    deleteDoc(accountDocumentRef(myId));
  };

  useEffect(() => {
    setList(null);
    const queryConstants = [limit(100), orderBy("createdAt", "desc")];
    const d = new Date();
    if (filter === "days" || filter === "monthes") {
      const hour = d.getHours() + d.getTimezoneOffset() / 60 - 1;
      queryConstants.unshift(where("hours", "==", (hour + 24) % 24));
    }
    if (filter === "monthes") {
      queryConstants.unshift(where("days", "==", d.getDate()));
    }
    return onSnapshot(
      query(accountLogCollectionRef(myId), ...queryConstants),
      snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      }
    );
  }, [myId, filter]);

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
            <select
              value={filter}
              onChange={e => {
                const { value } = e.target;
                if (
                  value === "hours" ||
                  value === "days" ||
                  value === "monthes"
                ) {
                  setFilter(value);
                }
              }}
              css={filterSelectStyle}
            >
              <option value="hours">hourly</option>
              <option value="days">daily</option>
              <option value="monthes">monthly</option>
            </select>
            &nbsp;
            <button type="button" onClick={clearAccount} css={buttonLinkStyle}>
              clear
            </button>
            &nbsp;
          </>
        ) : null}
        <button type="button" onClick={handleLogout} css={buttonLinkStyle}>
          logout
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
