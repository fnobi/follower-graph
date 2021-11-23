import { stringify } from "querystring";
import { css } from "@emotion/react";
import { runTransaction } from "firebase/firestore";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { em, percent } from "~/lib/cssUtil";
import { buttonLinkStyle } from "~/local/commonCss";
import { profileFollowDocumentRef, twitterDocumentRef } from "~/local/database";
import { useMeStore } from "~/local/useMeStore";
import { firebaseFirestore } from "~/local/firebaseApp";

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

const NewAccountForm = () => {
  const [account, setAccount] = useState("");
  const { user } = useMeStore();
  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account || !user || !user.id) {
      return;
    }
    const twitterRef = twitterDocumentRef(account);
    await runTransaction(firebaseFirestore(), async t => {
      const d = await t.get(twitterRef);
      if (!d.exists()) {
        t.set(twitterRef, { isTracking: true, owner: user.id });
      }
      t.set(profileFollowDocumentRef(user.id, account), {
        createdAt: Date.now()
      });
    });
    router.push(`/?${stringify({ id: account })}`);
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
