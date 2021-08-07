import { firebaseFirestore } from "~/local/firebaseApp";

export const usersCollectionRef = () => firebaseFirestore().collection("users");
export const usersDocumentRef = (id: string) => usersCollectionRef().doc(id);
export const usersLogCollectionRef = (id: string) =>
  usersDocumentRef(id).collection("log");
