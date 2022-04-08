import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, percent, px } from "~/lib/cssUtil";
import { padLeft } from "~/lib/lodashLike";
import { twitterEntryDocumentRef } from "~/local/database";
import { parseTwitterEntry, TwitterEntry } from "~/scheme/TwitterEntry";

const wrapperStyle = css({
  display: "block",
  backgroundColor: "#333",
  border: `solid ${px(1)} #fff`,
  color: "inherit",
  textDecoration: "none",
  padding: em(0.5)
});

const mainTextStyle = css({});

const dateStyle = css({
  fontSize: percent(50),
  textAlign: "right"
});

const EntryView: FC<{ name: string; id: string }> = ({ name, id }) => {
  const [entry, setEntry] = useState<TwitterEntry | null>(null);

  const href = useMemo(() => `https://twitter.com/${name}/status/${id}`, [
    name,
    id
  ]);

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
    const ref = twitterEntryDocumentRef(id);
    return onSnapshot(ref, snapshot => {
      setEntry(parseTwitterEntry(snapshot.data()));
    });
  }, [id]);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" css={wrapperStyle}>
      {entry ? (
        <>
          <div css={mainTextStyle}>{entry.text}</div>
          <div css={dateStyle}>{date}</div>
        </>
      ) : (
        "loading..."
      )}
    </a>
  );
};

export default EntryView;
