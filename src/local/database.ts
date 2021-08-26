import { collection, doc, getFirestore } from "firebase/firestore";

export const accountCollectionRef = () => collection(getFirestore(), "users");
export const accountDocumentRef = (id: string) =>
  doc(getFirestore(), accountCollectionRef().path, id);
export const accountLogCollectionRef = (id: string) =>
  collection(getFirestore(), accountDocumentRef(id).path, "logs");
