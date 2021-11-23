import { useRouter } from "next/router";
import TwitterListView from "~/components/TwitterListView";
import ProfileView from "~/components/ProfileView";

const PageIndex = () => {
  const router = useRouter();
  const { id: idQuery } = router.query;
  const twitterId = String(idQuery || "");
  return twitterId ? (
    <ProfileView twitterId={twitterId} onBack={() => router.push("/")} />
  ) : (
    <TwitterListView />
  );
};

export default PageIndex;
