import firebase from "firebase/app";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
import { firebaseAuth } from "~/local/firebaseApp";
import { buttonLinkStyle, CUSTOM_FONT_FAMILY } from "~/local/commonCss";

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

const titleStyle = css({
  fontFamily: CUSTOM_FONT_FAMILY,
  fontSize: percent(300)
});

const TitleView = () => {
  const signIn = () => {
    const p = new firebase.auth.GoogleAuthProvider();
    firebaseAuth().signInWithPopup(p);
  };

  return (
    <div css={wrapperStyle}>
      <h1 css={titleStyle}>follower graph</h1>
      <button type="button" onClick={signIn} css={buttonLinkStyle}>
        login with google
      </button>
    </div>
  );
};

export default TitleView;
