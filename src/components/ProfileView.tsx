import { css } from "@emotion/react";
import { FC } from "react";
import { pcp, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import { CUSTOM_FONT_FAMILY } from "~/local/commonCss";
import useAccountIcon from "~/local/useAccountIcon";
import { TwitterAccount } from "~/scheme/TwitterAccount";

const wrapperStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: CUSTOM_FONT_FAMILY,
  [MQ_MOBILE]: {
    fontSize: spp(30)
  },
  [MQ_DESKTOP]: {
    fontSize: pcp(30)
  }
});

const iconStyle = css({
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  backgroundPosition: "center",
  [MQ_MOBILE]: {
    width: spp(100),
    height: spp(100),
    marginRight: spp(20)
  },
  [MQ_DESKTOP]: {
    width: pcp(100),
    height: pcp(100),
    marginRight: pcp(20)
  }
});

const idStyle = css({
  [MQ_MOBILE]: {
    fontSize: spp(50)
  },
  [MQ_DESKTOP]: {
    fontSize: pcp(50)
  }
});

const ProfileView: FC<{ name: string; account: TwitterAccount }> = ({
  name,
  account
}) => {
  const style = useAccountIcon(account);
  return (
    <div css={wrapperStyle}>
      <div css={iconStyle} style={style} />
      <div>
        <div css={idStyle}>@{name}</div>
        <div>{account.name}</div>
      </div>
    </div>
  );
};

export default ProfileView;
