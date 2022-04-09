import { css } from "@emotion/react";
import { FC } from "react";
import { em, pcp, px, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";
import { CUSTOM_FONT_FAMILY, THEME_TOOLTIP_BG } from "~/local/commonCss";
import useAccountIcon from "~/local/useAccountIcon";
import { TwitterAccount } from "~/scheme/TwitterAccount";

const wrapperStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: CUSTOM_FONT_FAMILY,
  lineHeight: 1,
  [MQ_MOBILE]: {
    fontSize: spp(30)
  },
  [MQ_DESKTOP]: {
    fontSize: pcp(30)
  }
});

const contentStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: THEME_TOOLTIP_BG,
  border: `solid ${px(1)} rgba(255,255,255,0.2)`,
  [MQ_MOBILE]: {
    padding: spp(20)
  },
  [MQ_DESKTOP]: {
    padding: pcp(20)
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
  marginBottom: em(0.2),
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
}) => (
  <div css={wrapperStyle}>
    <div css={contentStyle}>
      <div css={iconStyle} style={useAccountIcon(account)} />
      <div>
        <div css={idStyle}>@{name}</div>
        <div>{account.name}</div>
      </div>
    </div>
  </div>
);

export default ProfileView;
