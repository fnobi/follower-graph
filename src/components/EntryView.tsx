import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, pcp, percent, px, spp } from "~/lib/cssUtil";
import { padLeft } from "~/lib/lodashLike";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import { twitterEntryDocumentRef } from "~/local/database";
import { parseTwitterEntry, TwitterEntry } from "~/scheme/TwitterEntry";

const wrapperStyle = css({
  "--focusColor": "#fff",
  display: "block",
  backgroundColor: "#003",
  color: "var(--focusColor)",
  border: `solid ${px(1)} rgba(255,255,255,0.2)`,
  padding: em(0.8),
  a: {
    color: "inherit",
    textDecoration: "none"
  },
  [MQ_MOBILE]: { fontSize: spp(30) },
  [MQ_DESKTOP]: { fontSize: pcp(30) }
});

const mainTextStyle = css({});

const dateStyle = css({
  fontSize: percent(50),
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
    return [
      [d.getMonth() + 1, d.getDate()].join("/"),
      [d.getHours(), d.getMinutes()].map(n => padLeft(n, 2)).join(":")
    ].join(" ");
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

  if (!entry) {
    return null;
  }

  return (
    <div css={wrapperStyle}>
      <>
        <div css={mainTextStyle}>{entry.text}</div>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <div css={dateStyle}>{date}</div>
          </a>
        ) : null}
      </>
    </div>
  );
};

export default EntryView;
