import firebase from "firebase/app";
import { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { em, percent } from "~/lib/cssUtil";
import { firebaseAuth } from "~/local/firebaseApp";
import GraphView from "~/components/GraphView";

type UserInfo = {
  id: string;
};

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100)
});

const footerStyle = css({
  position: "fixed",
  bottom: em(1),
  right: em(1)
});

const PageIndex = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    firebaseAuth().onAuthStateChanged(u => setUser(u ? { id: u.uid } : null));
  }, []);

  const signIn = () => {
    const p = new firebase.auth.GoogleAuthProvider();
    firebaseAuth().signInWithPopup(p);
  };

  const signOut = () => {
    firebaseAuth().signOut();
  };

  return user ? (
    <div>
      <GraphView myId={user.id} />
      <div css={footerStyle}>
        <button type="button" onClick={signOut}>
          logout
        </button>
      </div>
    </div>
  ) : (
    <div css={wrapperStyle}>
      <button type="button" onClick={signIn}>
        login
      </button>
    </div>
  );
};

export default PageIndex;
