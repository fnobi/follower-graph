import { firebaseFirestore } from "~/local/firebaseApp";

export const accountCollectionRef = () =>
  firebaseFirestore().collection("users");
export const accountDocumentRef = (id: string) =>
  accountCollectionRef().doc(id);
export const accountLogCollectionRef = (id: string) =>
  accountDocumentRef(id).collection("log");
