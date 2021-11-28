import { stringify } from "querystring";
import { css } from "@emotion/react";
import { runTransaction } from "firebase/firestore";
import { useRouter } from "next/router";
import { FormEvent, useMemo, useState } from "react";
import { pcp, percent, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import { buttonLinkStyle, CUSTOM_FONT_FAMILY } from "~/local/commonCss";
import { profileFollowDocumentRef, twitterDocumentRef } from "~/local/database";
import { useMeStore } from "~/local/useMeStore";
import { firebaseFirestore } from "~/local/firebaseApp";
import { TwitterAccount } from "~/scheme/TwitterAccount";

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
  fontWeight: "bold",
  fontSize: percent(150)
});

const textInputStyle = css({
  input: {
    fontSize: "inherit"
  },
  [MQ_MOBILE]: {
    marginTop: spp(48),
    input: {
      width: spp(955)
    }
  },
  [MQ_DESKTOP]: {
    marginTop: pcp(48),
    input: {
      width: pcp(955)
    }
  }
});

const previewStyle = css({
  fontFamily: CUSTOM_FONT_FAMILY,
  fontSize: percent(150),
  [MQ_MOBILE]: {
    marginTop: spp(32),
    marginBottom: spp(48)
  },
  [MQ_MOBILE]: {
    marginTop: pcp(32),
    marginBottom: pcp(48)
  }
});

const NewAccountForm = () => {
  const { user } = useMeStore();
  const router = useRouter();
  const [editing, setEditing] = useState("");
  const account = useMemo(() => {
    const matchData = editing.match(/[a-zA-z0-9_]+$/);
    if (!matchData) {
      return "";
    }
    return matchData[0];
  }, [editing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account || !user || !user.id) {
      return;
    }
    const twitterRef = twitterDocumentRef(account);
    await runTransaction(firebaseFirestore(), async t => {
      const d = await t.get(twitterRef);
      if (!d.exists()) {
        const p: Partial<TwitterAccount> = { isTracking: true, owner: user.id };
        t.set(twitterRef, p);
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
      <p>type twitter profile url or screen name.</p>
      <p css={textInputStyle}>
        <input
          type="text"
          value={editing}
          onChange={e => setEditing(e.target.value)}
        />
      </p>
      <p css={previewStyle}>{account ? <>@{account}</> : "-"}</p>
      <p>
        <input
          type="submit"
          value="ok"
          css={buttonLinkStyle}
          disabled={!account}
        />
      </p>
    </form>
  );
};

export default NewAccountForm;
