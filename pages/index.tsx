import firebase from "firebase/app";
import { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
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

const PageIndex = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    firebaseAuth().onAuthStateChanged(u => setUser(u ? { id: u.uid } : null));
  }, []);

  const signIn = () => {
    const p = new firebase.auth.GoogleAuthProvider();
    firebaseAuth().signInWithPopup(p);
  };

  return user ? (
    <GraphView myId={user.id} />
  ) : (
    <div css={wrapperStyle}>
      <button type="button" onClick={signIn}>
        login
      </button>
    </div>
  );
};

export default PageIndex;
