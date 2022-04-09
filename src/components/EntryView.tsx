import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, pcp, px, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import { THEME_TOOLTIP_BG } from "~/local/commonCss";
import { twitterEntryDocumentRef } from "~/local/database";
import { formatDateTime } from "~/local/dateUtil";
import { parseTwitterEntry, TwitterEntry } from "~/scheme/TwitterEntry";

const wrapperStyle = css({
  "--focusColor": "#fff",
  display: "block",
  backgroundColor: THEME_TOOLTIP_BG,
  color: "var(--focusColor)",
  border: `solid ${px(1)} rgba(255,255,255,0.2)`,
  padding: em(0.8),
  textDecoration: "none",
  [MQ_MOBILE]: {
    padding: spp(20),
    fontSize: spp(30),
    width: spp(980)
  },
  [MQ_DESKTOP]: {
    padding: pcp(20),
    fontSize: pcp(30),
    width: pcp(1500)
  }
});

const mainTextStyle = css({});

const dateStyle = css({
  textAlign: "right"
});

const EntryView: FC<{
  name: string;
  focusIndex: number;
  tweetEntries: { id: string; index: number }[];
}> = ({ name, focusIndex, tweetEntries }) => {
  const [entry, setEntry] = useState<TwitterEntry | null>(null);
  const focusItem = useMemo(
    () => tweetEntries.find(item => item.index === focusIndex),
    [tweetEntries, focusIndex]
  );
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
    <a css={wrapperStyle} href={href} target="_blank" rel="noopener noreferrer">
      <div css={mainTextStyle}>{entry.text}</div>
      <div css={dateStyle}>{date}</div>
    </a>
  );
};

export default EntryView;
