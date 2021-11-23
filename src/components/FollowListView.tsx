import { stringify } from "querystring";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { css } from "@emotion/react";
import { em, percent, px, spp } from "~/lib/cssUtil";
import { signOut } from "firebase/auth";
import {
  profileFollowCollectionRef,
  twitterDocumentRef
} from "~/local/database";
import { buttonLinkStyle, CUSTOM_FONT_FAMILY } from "~/local/commonCss";
import { useMeStore } from "~/local/useMeStore";
import { firebaseAuth } from "~/local/firebaseApp";
import { parseTwitterAccount, TwitterAccount } from "~/scheme/TwitterAccount";

const wrapperStyle = css({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  minHeight: percent(100),
  textAlign: "center"
});

const contentStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  margin: spp(150, 0)
});

const titleStyle = css({
  fontFamily: CUSTOM_FONT_FAMILY,
  fontSize: percent(300)
});

const followItemCellStyle = css({
  marginBottom: spp(40)
});

const footerStyle = css({
  position: "fixed",
  bottom: em(1),
  right: em(1)
});

const accountCellStyle = css({
  color: "inherit",
  textDecoration: "none",
  padding: 0,
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  width: spp(955),
  border: `solid ${px(1)} #fff`,
  textAlign: "left",
  boxShadow: `${px(1)} ${px(2)} ${px(0)} #fff`,
  transform: `translate(${px(-1)},${px(-2)})`,
  "&:hover": {
    boxShadow: "none",
    cursor: "pointer",
    transform: `translate(${px(0)},${px(0)})`
  }
});

const cellIconStyle = css({
  minWidth: spp(160),
  minHeight: spp(160),
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center"
});

const cellTextStyle = css({
  padding: em(0, 0.5),
  fontSize: spp(32),
  strong: {
    display: "block",
    fontFamily: CUSTOM_FONT_FAMILY,
    fontSize: percent(200),
    wordBreak: "break-word"
  }
});

const AccountCell = (props: { id: string }) => {
  const { id } = props;
  const [twitterAccount, setTwitterAccount] = useState<TwitterAccount | null>(
    null
  );

  const href = useMemo(() => `/?${stringify({ id })}`, [id]);

  useEffect(() => {
    if (!id) {
      return () => {};
    }
    return onSnapshot(twitterDocumentRef(id), d =>
      setTwitterAccount(parseTwitterAccount(d.data()))
    );
  }, [id]);

  return (
    <Link href={href}>
      <a href={href} css={accountCellStyle}>
        <div
          css={cellIconStyle}
          style={{
            backgroundImage:
              twitterAccount && twitterAccount.iconUrl
                ? `url(${twitterAccount.iconUrl})`
                : "none"
          }}
        />
        <div css={cellTextStyle}>
          <strong>@{id}</strong>
          {twitterAccount ? twitterAccount.name : null}
        </div>
      </a>
    </Link>
  );
};

const FollowListView = () => {
  const router = useRouter();
  const { user } = useMeStore();
  const [twtterList, setTwtterList] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !user.id) {
      return () => {};
    }
    return onSnapshot(
      query(profileFollowCollectionRef(user.id), orderBy("createdAt", "desc")),
      snapshot => setTwtterList(snapshot.docs.map(d => d.id))
    );
  }, [user]);

  const handleLogout = () => signOut(firebaseAuth());

  return (
    <div css={wrapperStyle}>
      <div css={contentStyle}>
        <h1 css={titleStyle}>follower graph</h1>
        <ul>
          {[...twtterList].map(id => (
            <li key={id} css={followItemCellStyle}>
              <AccountCell id={id} />
            </li>
          ))}
        </ul>
        <p>
          <button
            type="button"
            css={buttonLinkStyle}
            onClick={() => router.push("/create")}
          >
            +
          </button>
        </p>
      </div>
      <div css={footerStyle}>
        <button type="button" onClick={handleLogout} css={buttonLinkStyle}>
          logout
        </button>
      </div>
    </div>
  );
};

export default FollowListView;
