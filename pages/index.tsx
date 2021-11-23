import { useRouter } from "next/router";
import FollowListView from "~/components/FollowListView";
import DataLogView from "~/components/DataLogView";

const PageIndex = () => {
  const router = useRouter();
  const { id: idQuery } = router.query;
  const twitterId = String(idQuery || "");
  return twitterId ? (
    <DataLogView twitterId={twitterId} onBack={() => router.push("/")} />
  ) : (
    <FollowListView />
  );
};

export default PageIndex;
