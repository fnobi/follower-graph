import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, px } from "~/lib/cssUtil";
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

const EntryView: FC<{ id: string }> = ({ id }) => {
  const [entry, setEntry] = useState<TwitterEntry | null>(null);

  const href = useMemo(() => `https://twitter.com/fnobi/status/${id}`, [id]);

  useEffect(() => {
    setEntry(null);
    const ref = twitterEntryDocumentRef(id);
    return onSnapshot(ref, snapshot => {
      setEntry(parseTwitterEntry(snapshot.data()));
    });
  }, [id]);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" css={wrapperStyle}>
      {entry ? entry.text : "loading..."}
    </a>
  );
};

export default EntryView;
