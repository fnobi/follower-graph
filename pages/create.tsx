import { useRouter } from "next/router";
import { css } from "@emotion/react";
import { em } from "~/lib/cssUtil";
import { buttonLinkStyle } from "~/local/commonCss";
import NewAccountForm from "~/components/NewAccountForm";

const headerStyle = css({
  position: "fixed",
  top: em(1),
  left: em(1)
});

const PageCreate = () => {
  const router = useRouter();
  return (
    <div>
      <NewAccountForm />
      <div css={headerStyle}>
        <button
          type="button"
          css={buttonLinkStyle}
          onClick={() => router.push("/")}
        >
          &lt;
        </button>
      </div>
    </div>
  );
};

export default PageCreate;
