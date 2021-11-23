import { stringify } from "querystring";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onSnapshot } from "firebase/firestore";
import { css } from "@emotion/react";
import { em, percent } from "~/lib/cssUtil";
import { signOut } from "firebase/auth";
import { twitterCollectionRef } from "~/local/database";
import { buttonLinkStyle } from "~/local/commonCss";
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
    return onSnapshot(twitterCollectionRef(), snapshot => {
      setTwtterList(snapshot.docs.map(d => d.id));
    });
  }, [user]);

  const handleLogout = () => signOut(firebaseAuth());

  return (
    <div css={wrapperStyle}>
      {/* TODO: ルックをまともにする・タイトルをここにもいれる */}
      <ul>
        {[...twtterList].map(id => (
          <li key={id}>
            <button
              type="button"
              onClick={() => router.push(`/?${stringify({ id })}`)}
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
          create
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
