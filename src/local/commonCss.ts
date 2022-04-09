import { css } from "@emotion/react";
import { em, pcp, px, spp } from "~/lib/cssUtil";
import { MQ_DESKTOP, MQ_MOBILE } from "~/lib/MQ";

export const THEME_HIGHLIGHT = "#007";
export const THEME_BG = "#003";
export const THEME_GRAPH_BG = "#000";

export const globalStyle = css({
  body: {
    backgroundColor: THEME_BG,
    color: "#fff",
    fontFamily: "sans-serif",
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

export const buttonLinkStyle = css(buttonReset, {
  backgroundColor: THEME_BG,
  border: `solid ${px(1)} #fff`,
  padding: em(0, 0.5),
  boxShadow: `${px(1)} ${px(2)} ${px(0)} #fff`,
  transform: `translate(${px(-1)},${px(-2)})`,
  "&:hover": {
    boxShadow: "none",
    cursor: "pointer",
    transform: `translate(${px(0)},${px(0)})`
  }
});

export const CUSTOM_FONT_FAMILY = "'Bebas Neue', cursive";
