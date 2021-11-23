import { FC, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "~/local/firebaseApp";
import { useMeStore } from "~/local/useMeStore";
import LoadingView from "~/components/LoadingView";
import LoginView from "~/components/LoginView";

const LayoutRoot: FC = ({ children }) => {
  const { user, setUser } = useMeStore();

  useEffect(() => {
    onAuthStateChanged(firebaseAuth(), u => setUser({ id: u ? u.uid : "" }));
  }, []);

  if (!user) {
    return <LoadingView />;
  }
  if (!user.id) {
    return <LoginView />;
  }

  return <div>{children}</div>;
};

export default LayoutRoot;
