import { useRouter } from "next/router";
import FollowListScene from "~/components/FollowListScene";
import DataLogScene from "~/components/DataLogScene";

const PageIndex = () => {
  const router = useRouter();
  const { id: idQuery } = router.query;
  const twitterId = String(idQuery || "");
  return twitterId ? (
    <DataLogScene twitterId={twitterId} onBack={() => router.push("/")} />
  ) : (
    <FollowListScene />
  );
};

export default PageIndex;
