import { css } from "@emotion/react";
import { FormEvent, useState } from "react";
import { em, percent } from "~/lib/cssUtil";
import { buttonLinkStyle } from "~/local/commonCss";
import { accountDocumentRef } from "~/local/database";

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

const titleStyle = css({
  fontWeight: "bold"
});

const textInputStyle = css({
  margin: em(0.5, 0, 1, 0)
});

const NewAccountForm = (props: { myId: string }) => {
  const { myId } = props;
  const [account, setAccount] = useState("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!account || !myId) {
      return;
    }
    accountDocumentRef(myId).set({ twitter: account });
  };
  return (
    <form onSubmit={handleSubmit} css={wrapperStyle}>
      <h2 css={titleStyle}>register new account</h2>
      <p css={textInputStyle}>
        <input
          type="text"
          value={account}
          onChange={e => setAccount(e.target.value)}
        />
      </p>
      <p>
        <input type="submit" value="ok" css={buttonLinkStyle} />
      </p>
    </form>
  );
};

export default NewAccountForm;
