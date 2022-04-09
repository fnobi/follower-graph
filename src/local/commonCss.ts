import { css } from "@emotion/react";
import { em, pcp, px, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";

export const THEME_BG = "#22577E";
export const THEME_GRAPH_BG = "#5584AC";
export const THEME_TOOLTIP_BG = THEME_GRAPH_BG;
export const THEME_HIGHLIGHT = "#95D1CC";
export const THEME_BUTTON = "#FAFFAF";

export const globalStyle = css({
  body: {
    backgroundColor: THEME_BG,
    color: "#fff",
    fontFamily: "'Noto Sans JP', sans-serif",
    lineHeight: 1.5,
    textSizeAdjust: "100%",
    [MQ_DESKTOP]: {
      fontSize: pcp(48)
    },
    [MQ_MOBILE]: {
      fontSize: spp(48)
    }
  }
});

export const linkReset = css({
  display: "inline-block",
  textDecoration: "none",
  color: "inherit"
});

export const buttonReset = css({
  padding: 0,
  margin: 0,
  appearance: "none",
  border: "none",
  background: "none",
  font: "inherit",
  textAlign: "inherit",
  color: "inherit"
});

export const responsiveImageTile = (
  image: {
    src: string;
    width: number;
    height: number;
  },
  image2?: {
    src: string;
    width: number;
    height: number;
  }
) =>
  css({
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundImage: image2 ? undefined : `url(${image.src})`,
    [MQ_MOBILE]: {
      width: spp(image.width),
      height: spp(image.height),
      backgroundImage: image2 ? `url(${image.src})` : undefined
    },
    [MQ_DESKTOP]: {
      width: pcp(image2 ? image2.width : image.width),
      height: pcp(image2 ? image2.height : image.height),
      backgroundImage: image2 ? `url(${image2.src})` : undefined
    }
  });

export const commonShadowStyle = css({
  border: `solid ${px(1)} #000`,
  [MQ_MOBILE]: {
    boxShadow: `${spp(8)} ${spp(8)} ${spp(0)} #000`,
    transform: `translate(${spp(-8)},${spp(-8)})`
  },
  [MQ_DESKTOP]: {
    boxShadow: `${pcp(10)} ${pcp(10)} ${pcp(0)} #000`,
    transform: `translate(${pcp(-10)},${pcp(-10)})`,
    "&:hover": {
      boxShadow: "none",
      cursor: "pointer",
      transform: `translate(${pcp(0)},${pcp(0)})`
    }
  }
});

export const buttonLinkStyle = css(buttonReset, commonShadowStyle, {
  backgroundColor: THEME_BUTTON,
  color: THEME_BG,
  padding: em(0.2, 0.6)
});

export const CUSTOM_FONT_FAMILY = "'Bebas Neue', cursive";
