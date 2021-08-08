import { useEffect, useState } from "react";
import { firebaseAuth } from "~/local/firebaseApp";
import LoadingView from "~/components/LoadingView";
import ProfileView from "~/components/ProfileView";
import TitleView from "~/components/TitleView";

type UserInfo = {
  id: string;
};

const PageIndex = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    firebaseAuth().onAuthStateChanged(u => setUser({ id: u ? u.uid : "" }));
  }, []);

  if (!user) {
    return <LoadingView />;
  }

  return user.id ? <ProfileView myId={user.id} /> : <TitleView />;
};

export default PageIndex;
