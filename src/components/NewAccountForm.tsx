import { FormEvent, useState } from "react";
import { usersDocumentRef } from "~/local/database";

const NewAccountForm = (props: { myId: string }) => {
  const { myId } = props;
  const [account, setAccount] = useState("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!account || !myId) {
      return;
    }
    usersDocumentRef(myId).set({ twitter: account });
  };
  return (
    <form onSubmit={handleSubmit}>
      register new account:
      <br />
      <input
        type="text"
        value={account}
        onChange={e => setAccount(e.target.value)}
      />
      <br />
      <input type="submit" value="ok" />
    </form>
  );
};

export default NewAccountForm;
