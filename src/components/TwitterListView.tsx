import { stringify } from "querystring";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { css } from "@emotion/react";
import { em, percent } from "~/lib/cssUtil";
import { signOut } from "firebase/auth";
import { profileFollowCollectionRef } from "~/local/database";
import { buttonLinkStyle, buttonReset } from "~/local/commonCss";
import { useMeStore } from "~/local/useMeStore";
import { firebaseAuth } from "~/local/firebaseApp";

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100),
  textAlign: "center"
});

const followItemCellStyle = css({
  marginBottom: em(0.5),
  button: {
    textDecoration: "underline"
  }
});

const footerStyle = css({
  position: "fixed",
  bottom: em(1),
  right: em(1)
});

const TwitterListView = () => {
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
      {/* TODO: ルックをまともにする・タイトルをここにもいれる */}
      <ul>
        {[...twtterList].map(id => (
          <li key={id} css={followItemCellStyle}>
            <button
              type="button"
              onClick={() => router.push(`/?${stringify({ id })}`)}
              css={buttonReset}
            >
              {id}
            </button>
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
      <div css={footerStyle}>
        <button type="button" onClick={handleLogout} css={buttonLinkStyle}>
          logout
        </button>
      </div>
    </div>
  );
};

export default TwitterListView;
