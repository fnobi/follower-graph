import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoadingView from "~/components/LoadingView";
import ProfileView from "~/components/ProfileView";
import TitleView from "~/components/TitleView";

type UserInfo = {
  id: string;
};

const PageIndex = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    onAuthStateChanged(getAuth(), u => setUser({ id: u ? u.uid : "" }));
  }, []);

  if (!user) {
    return <LoadingView />;
  }

  return user.id ? <ProfileView myId={user.id} /> : <TitleView />;
};

export default PageIndex;
