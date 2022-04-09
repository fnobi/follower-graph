import { css } from "@emotion/react";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { em, pcp, percent, px, spp } from "~/lib/cssUtil";
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
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import {
  profileFollowDocumentRef,
  twitterDocumentRef,
  twitterLogCollectionRef
} from "~/local/database";
import {
  buttonLinkStyle,
  buttonReset,
  CUSTOM_FONT_FAMILY,
  THEME_HIGHLIGHT
} from "~/local/commonCss";
import { useMeStore } from "~/local/useMeStore";
import { formatDateTime } from "~/local/dateUtil";
import { parseTwitterData, TwitterData } from "~/scheme/TwitterData";
import { parseTwitterAccount, TwitterAccount } from "~/scheme/TwitterAccount";
import ProfileView from "~/components/ProfileView";
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
  left: em(1),
  right: em(1),
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

const headerLeftStyle = css({
  flexGrow: 1,
  width: "100%"
});

const headerRightStyle = css({
  display: "flex"
});

const profileViewStyle = css({
  position: "absolute",
  width: percent(100),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  [MQ_MOBILE]: {
    top: spp(200)
  },
  [MQ_DESKTOP]: {
    top: pcp(200)
  }
});

const mainStyle = css({
  position: "absolute",
  bottom: percent(0),
  width: percent(100),
  background: THEME_HIGHLIGHT,
  "&:before": {
    content: "''",
    display: "block",
    position: "absolute",
    left: percent(50),
    bottom: percent(100),
    borderStyle: "solid",
    borderColor: `transparent transparent ${THEME_HIGHLIGHT} transparent`
  },
  [MQ_MOBILE]: {
    height: spp(650),
    "&:before": {
      borderWidth: spp(0, 50, 50, 50),
      marginLeft: spp(-50)
    }
  },
  [MQ_DESKTOP]: {
    height: pcp(650),
    "&:before": {
      borderWidth: pcp(0, 50, 50, 50),
      marginLeft: pcp(-50)
    }
  }
});

const statsViewStyle = css({
  fontFamily: CUSTOM_FONT_FAMILY,
  textAlign: "center",
  lineHeight: 1,
  strong: {
    display: "block",
    fontWeight: "bold",
    fontSize: percent(200)
  },
  [MQ_MOBILE]: {
    margin: spp(50, 0),
    fontSize: spp(70)
  },
  [MQ_DESKTOP]: {
    margin: pcp(50, 0),
    fontSize: pcp(70)
  }
});

const entryViewStyle = css({
  [MQ_MOBILE]: {
    margin: spp(0, 50)
  },
  [MQ_DESKTOP]: {
    margin: pcp(0, 50)
  }
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
  const [account, setAccount] = useState<TwitterAccount | null>(null);
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

  const axisIndexes = useMemo(() => {
    const indexes: number[] = [];
    (list || []).reduce((prev, item, i) => {
      const d = new Date(item.createdAt);
      const factor = (() => {
        switch (filter) {
          case "hours":
            return d.getDate();
          case "days":
            return d.getMonth();
          case "monthes":
            return d.getFullYear();
          default:
            return 0;
        }
      })();
      if (prev >= 0 && factor !== prev) {
        indexes.push(i - 1);
      }
      return factor;
    }, -1);
    return indexes;
  }, [list]);

  const focusIndex = useMemo(() => {
    if (!list) {
      return 0;
    }
    return calcFocusIndex(list, scroll);
  }, [scroll]);

  const focusItem = useMemo(() => (list ? list[focusIndex] || null : null), [
    list,
    focusIndex
  ]);

  const dateString = useMemo(() => {
    if (!focusItem) {
      return null;
    }
    const d = new Date(focusItem.createdAt);
    return formatDateTime(d);
  }, [focusItem]);

  const handleScroll = (fn: (s: number) => number) => {
    setScroll(s => clamp(0, 1, fn(s)));
  };

  const unfollowAccount = async () => {
    if (!user || !user.id) {
      return;
    }
    await deleteDoc(profileFollowDocumentRef(user.id, twitterId));
    router.push("/");
  };

  useEffect(() => {
    if (!twitterId) {
      return () => {};
    }
    return onSnapshot(twitterDocumentRef(twitterId), d =>
      setAccount(parseTwitterAccount(d.data()))
    );
  }, [twitterId]);

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

  if (!list) {
    return <LoadingView />;
  }

  return (
    <div>
      <GraphPolygonView
        list={list}
        entryIndexes={tweetEntries.map(t => t.index)}
        axisIndexes={axisIndexes}
        scroll={scroll}
        onScroll={handleScroll}
      />
      {account ? (
        <div css={profileViewStyle}>
          <ProfileView name={twitterId} account={account} />
        </div>
      ) : null}
      <div css={mainStyle}>
        {focusItem ? (
          <div css={statsViewStyle}>
            <strong>{focusItem.followersCount.toLocaleString()}</strong>
            {dateString}
          </div>
        ) : null}
        <div css={entryViewStyle}>
          {tweetEntries.length ? (
            <EntryView
              focusIndex={focusIndex}
              tweetEntries={tweetEntries}
              name={twitterId}
            />
          ) : null}
        </div>
      </div>
      <div css={headerStyle}>
        <div css={headerLeftStyle}>
          <button type="button" css={buttonLinkStyle} onClick={onBack}>
            &lt;
          </button>
        </div>
        {twitterId ? (
          <div css={headerRightStyle}>
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
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DataLogView;
