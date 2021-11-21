import { stringify } from "querystring";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { onSnapshot } from "@firebase/firestore";
import { firebaseAuth } from "~/local/firebaseApp";
import { twitterCollectionRef } from "~/local/database";
import LoadingView from "~/components/LoadingView";
import ProfileView from "~/components/ProfileView";
import TitleView from "~/components/TitleView";

type UserInfo = {
  id: string;
};

const PageIndex = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();
  const { id: idQuery } = router.query;
  const [twtterList, setTwtterList] = useState<string[]>([]);
  const twitterId = String(idQuery || "");

  useEffect(() => {
    onAuthStateChanged(firebaseAuth(), u => setUser({ id: u ? u.uid : "" }));
  }, []);

  useEffect(() => {
    if (!user || !user.id) {
      return () => {};
    }
    return onSnapshot(twitterCollectionRef(), snapshot => {
      setTwtterList(snapshot.docs.map(d => d.id));
    });
  }, [user]);

  if (!user) {
    return <LoadingView />;
  }
  if (!user.id) {
    return <TitleView />;
  }
  if (twitterId) {
    return (
      <ProfileView twitterId={twitterId} onBack={() => router.push("/")} />
    );
  }

  return (
    <div>
      <ul>
        {[...twtterList].map(id => (
          <li key={id}>
            <button
              type="button"
              onClick={() => router.push(`/?${stringify({ id })}`)}
            >
              {id}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageIndex;
