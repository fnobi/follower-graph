import { useMemo } from "react";
import { TwitterAccount } from "~/scheme/TwitterAccount";

const useAccountIcon = (twitterAccount: TwitterAccount | null) => {
  const iconUrl = useMemo(() => {
    if (!twitterAccount) {
      return [];
    }
    return [
      twitterAccount.iconUrl.replace(/_normal(\.(png|jpe?g|gif))$/, "$1"),
      twitterAccount.iconUrl
    ];
  }, [twitterAccount]);

  const twitterAccountIconStyle = useMemo(
    () => ({
      backgroundImage: iconUrl.length
        ? iconUrl.map(u => `url(${u})`).join(",")
        : "none"
    }),
    [iconUrl]
  );

  return twitterAccountIconStyle;
};

export default useAccountIcon;
