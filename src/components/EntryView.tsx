import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, pcp, percent, px, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import {
  buttonReset,
  THEME_BG,
  THEME_GRAPH_BG,
  THEME_TOOLTIP_BG
} from "~/local/commonCss";
import { twitterEntryDocumentRef } from "~/local/database";
import { formatDateTime } from "~/local/dateUtil";
import { parseTwitterEntry, TwitterEntry } from "~/scheme/TwitterEntry";

const roundNum = (n: number, count: number = 1) => {
  return Math.floor(n * 10 ** count) / 10 ** count;
};

const normalizeBigNumber = (n: number) => {
  if (n >= 10 ** 6) {
    return `${roundNum(n / 10 ** 6)}M`;
  }
  if (n >= 10 ** 3) {
    return `${roundNum(n / 10 ** 3)}K`;
  }
  return String(n);
};

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

const reactionBaloonStyle = css({
  position: "absolute",
  right: percent(0),
  bottom: percent(100),
  padding: em(0.5),
  marginBottom: em(0.8),
  maxWidth: em(9),
  backgroundColor: THEME_BG,
  fontSize: percent(80),
  lineHeight: 1.1,
  fontWeight: "bold",
  textAlign: "center",
  span: {
    display: "inline-block",
    paddingRight: em(0.4),
    "&:last-child": {
      paddingRight: em(0)
    }
  },
  strong: {
    fontSize: percent(150)
  },
  "&:before": {
    content: "''",
    display: "block",
    position: "absolute",
    left: percent(50),
    top: percent(100),
    borderStyle: "solid",
    borderColor: `${THEME_BG} transparent transparent transparent`,
    borderWidth: em(0.5, 0.5, 0, 0.5),
    marginLeft: em(-0.5)
  }
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
        {entry.likeCount || entry.retweetCount || entry.quoteCount ? (
          <div css={reactionBaloonStyle}>
            <span>
              <strong>{normalizeBigNumber(entry.likeCount)}</strong>&nbsp;like
            </span>
            <span>
              <strong>
                {normalizeBigNumber(entry.retweetCount + entry.quoteCount)}
              </strong>
              &nbsp;RT
            </span>
          </div>
        ) : null}
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
