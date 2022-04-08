import { css } from "@emotion/react";
import { onSnapshot } from "firebase/firestore";
import { FC, useEffect, useMemo, useState } from "react";
import { em, percent, px } from "~/lib/cssUtil";
import { padLeft } from "~/lib/lodashLike";
import { buttonReset } from "~/local/commonCss";
import { twitterEntryDocumentRef } from "~/local/database";
import { parseTwitterEntry, TwitterEntry } from "~/scheme/TwitterEntry";

const wrapperStyle = css({
  display: "block",
  backgroundColor: "#333",
  border: `solid ${px(1)} #fff`,
  padding: em(0.5),
  a: {
    color: "inherit",
    textDecoration: "none"
  }
});

const mainTextStyle = css({});

const dateStyle = css({
  fontSize: percent(50),
  textAlign: "right"
});

const arrowStyle = css(buttonReset, {
  "&:disabled": {
    opacity: 0.5
  }
});

const EntryView: FC<{ name: string; ids: string[] }> = ({ name, ids }) => {
  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState<TwitterEntry | null>(null);
  const id = useMemo(() => ids[index], [ids, index]);

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
    setIndex(0);
  }, [ids]);

  useEffect(() => {
    const ref = twitterEntryDocumentRef(id);
    return onSnapshot(ref, snapshot => {
      setEntry(parseTwitterEntry(snapshot.data()));
    });
  }, [id]);

  return (
    <div css={wrapperStyle}>
      {entry ? (
        <>
          <div css={mainTextStyle}>{entry.text}</div>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <div css={dateStyle}>{date}</div>
          </a>
          <div>
            <button
              type="button"
              css={arrowStyle}
              onClick={() => setIndex(i => i + 1)}
              disabled={index + 1 >= ids.length}
            >
              ＜
            </button>
            &nbsp;
            <button
              type="button"
              css={arrowStyle}
              onClick={() => setIndex(i => i - 1)}
              disabled={index - 1 < 0}
            >
              ＞
            </button>
          </div>
        </>
      ) : (
        "loading..."
      )}
    </div>
  );
};

export default EntryView;
