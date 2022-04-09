import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, pcp, percent, px, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import {
  buttonReset,
  THEME_GRAPH_BG,
  THEME_TOOLTIP_BG
} from "~/local/commonCss";
import { twitterEntryDocumentRef } from "~/local/database";
import { formatDateTime } from "~/local/dateUtil";
import { parseTwitterEntry, TwitterEntry } from "~/scheme/TwitterEntry";

const wrapperStyle = css({
  position: "relative",
  [MQ_MOBILE]: {
    width: spp(940)
  },
  [MQ_DESKTOP]: {
    width: pcp(1500)
  }
});

const bannerStyle = css({
  "--focusColor": "#fff",
  display: "block",
  backgroundColor: THEME_TOOLTIP_BG,
  color: "var(--focusColor)",
  border: `solid ${px(1)} rgba(255,255,255,0.2)`,
  padding: em(0.8),
  textDecoration: "none",
  userSelect: "none",
  [MQ_MOBILE]: {
    padding: spp(20),
    fontSize: spp(30)
  },
  [MQ_DESKTOP]: {
    padding: pcp(20),
    fontSize: pcp(30)
  }
});

const mainTextStyle = css({});

const dateStyle = css({
  textAlign: "right"
});

const arrowStyle = css(buttonReset, {
  position: "absolute",
  top: percent(0),
  height: percent(100),
  fontSize: percent(120),
  color: THEME_GRAPH_BG,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  userSelect: "none",
  "&:disabled": {
    opacity: 0,
    pointerEvents: "none"
  },
  [MQ_MOBILE]: {
    width: spp(100),
    margin: spp(0, -10)
  },
  [MQ_DESKTOP]: {
    width: pcp(100)
  }
});
const leftArrowStyle = css(arrowStyle, {
  right: percent(100),
  justifyContent: "flex-start"
});
const rightArrowStyle = css(arrowStyle, {
  left: percent(100),
  justifyContent: "flex-end"
});

const EntryView: FC<{
  name: string;
  focusIndex: number;
  tweetEntries: { id: string; index: number }[];
}> = ({ name, focusIndex, tweetEntries }) => {
  const [entry, setEntry] = useState<TwitterEntry | null>(null);
  const [index, setIndex] = useState(0);
  const focusItemArray = useMemo(
    () => tweetEntries.filter(item => item.index === focusIndex),
    [tweetEntries, focusIndex]
  );
  const focusItem = useMemo(() => focusItemArray[index], [
    focusItemArray,
    index
  ]);
  const id = useMemo(() => (focusItem ? focusItem.id : null), [focusItem]);

  const href = useMemo(
    () => (id ? `https://twitter.com/${name}/status/${id}` : null),
    [name, id]
  );

  const date = useMemo(() => {
    if (!entry) {
      return "";
    }
    const d = new Date(entry.createdAt);
    return formatDateTime(d);
  }, [entry]);

  useEffect(() => setIndex(0), [focusItemArray]);

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return () => {};
    }
    const ref = twitterEntryDocumentRef(id);
    return onSnapshot(ref, snapshot => {
      setEntry(parseTwitterEntry(snapshot.data()));
    });
  }, [id]);

  if (!entry || !href) {
    return null;
  }

  return (
    <div css={wrapperStyle}>
      <a
        css={bannerStyle}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div css={mainTextStyle}>{entry.text}</div>
        <div css={dateStyle}>{date}</div>
      </a>
      <button
        type="button"
        css={leftArrowStyle}
        disabled={index + 1 >= focusItemArray.length}
        onClick={() => setIndex(i => i + 1)}
      >
        〈
      </button>
      <button
        type="button"
        css={rightArrowStyle}
        disabled={index - 1 < 0}
        onClick={() => setIndex(i => i - 1)}
      >
        〉
      </button>
    </div>
  );
};

export default EntryView;
