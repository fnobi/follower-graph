import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { em, px } from "~/lib/cssUtil";
import { signOut } from "firebase/auth";
import {
  deleteDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  where
} from "firebase/firestore";
import { useRouter } from "next/router";
import { clamp, flatten, sortBy, uniq } from "~/lib/lodashLike";
import {
  profileFollowDocumentRef,
  twitterLogCollectionRef
} from "~/local/database";
import { buttonLinkStyle, buttonReset } from "~/local/commonCss";
import { firebaseAuth } from "~/local/firebaseApp";
import { useMeStore } from "~/local/useMeStore";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";
import EntryView from "~/components/EntryView";
import LoadingView from "~/components/LoadingView";
import { calcFocusIndex } from "~/components/GraphPolygonView";

const GraphPolygonView = dynamic(
  () => import("~/components/GraphPolygonView"),
  { ssr: false }
);

const headerStyle = css({
  position: "fixed",
  top: em(1),
  left: em(1)
});

const footerStyle = css({
  position: "fixed",
  bottom: em(1),
  right: em(1)
});

const entryInfoStyle = css({
  position: "absolute",
  right: em(0.5),
  left: em(0.5),
  bottom: em(4)
});

const filterSelectStyle = css(buttonReset, {
  border: `solid ${px(1)} #fff`,
  padding: em(0, 0.5),
  boxShadow: `${px(1)} ${px(2)} ${px(0)} #fff`,
  transform: `translate(${px(-1)},${px(-2)})`
});

// eslint-disable-next-line react/require-default-props
const DataLogView = (props: { twitterId: string; onBack?: () => void }) => {
  const { twitterId, onBack } = props;
  const router = useRouter();
  const { user } = useMeStore();
  const [list, setList] = useState<TwitterData[] | null>(null);
  const [filter, setFilter] = useState<"hours" | "days" | "monthes">("hours");
  const [scroll, setScroll] = useState(0);

  const tweetEntries = useMemo(() => {
    if (!list) {
      return [];
    }
    const reverseList = [...list].reverse();
    const tweetIdList = uniq(
      flatten(reverseList.map(item => item.recentTweets))
    );
    return sortBy(
      tweetIdList.map(id => {
        return {
          id,
          index:
            list.length -
            1 -
            reverseList.findIndex(({ recentTweets }) =>
              recentTweets.includes(id)
            )
        };
      }),
      item => -Number(item.id)
    );
  }, [list]);

  const handleScroll = (fn: (s: number) => number) => {
    setScroll(s => clamp(0, 1, fn(s)));
  };

  const handleLogout = () => {
    signOut(firebaseAuth());
  };

  const unfollowAccount = async () => {
    if (!user || !user.id) {
      return;
    }
    await deleteDoc(profileFollowDocumentRef(user.id, twitterId));
    router.push("/");
  };

  useEffect(() => {
    setList(null);
    const ref = twitterLogCollectionRef(twitterId);
    const queryConstants: QueryConstraint[] = [];
    const d = new Date();
    if (filter === "days" || filter === "monthes") {
      const hour = d.getHours() + d.getTimezoneOffset() / 60 - 1;
      queryConstants.push(where("hours", "==", (hour + 24) % 24));
    }
    if (filter === "monthes") {
      queryConstants.push(where("days", "==", d.getDate()));
    }
    return onSnapshot(
      query(ref, ...queryConstants, limit(100), orderBy("createdAt", "desc")),
      snapshot => {
        setList(snapshot.docs.map(s => parseTwitterData(s.data())));
      }
    );
  }, [twitterId, filter]);

  useEffect(() => {
    if (!list) {
      return;
    }
    const focusIndex = calcFocusIndex(list, scroll);
    console.log("focusIndex:", focusIndex);
  }, [scroll]);

  if (!list) {
    return <LoadingView />;
  }

  return (
    <div>
      <GraphPolygonView
        list={list}
        twitterName={twitterId}
        scroll={scroll}
        onScroll={handleScroll}
      />
      {tweetEntries.length ? (
        <div css={entryInfoStyle}>
          <EntryView tweetEntries={tweetEntries} name={twitterId} />
        </div>
      ) : null}
      <div css={headerStyle}>
        <button type="button" css={buttonLinkStyle} onClick={onBack}>
          &lt;back
        </button>
      </div>
      <div css={footerStyle}>
        {twitterId ? (
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
            <button
              type="button"
              onClick={unfollowAccount}
              css={buttonLinkStyle}
            >
              unfollow
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

export default DataLogView;
