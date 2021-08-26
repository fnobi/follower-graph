import { collection, doc } from "firebase/firestore";
import { firebaseFirestore } from "./firebaseApp";

const COLLECTION_PATH_USERS = () => ["users"];
const DOCUMNENT_PATH_USERS = (userId: string) => [
  ...COLLECTION_PATH_USERS(),
  userId
];
const COLLECTION_PATH_USERS_LOG = (userId: string) => [
  ...DOCUMNENT_PATH_USERS(userId),
  "log"
];

export const accountCollectionRef = () =>
  collection(firebaseFirestore(), COLLECTION_PATH_USERS().join("/"));
export const accountDocumentRef = (id: string) =>
  doc(firebaseFirestore(), DOCUMNENT_PATH_USERS(id).join("/"));
export const accountLogCollectionRef = (id: string) =>
  collection(firebaseFirestore(), COLLECTION_PATH_USERS_LOG(id).join("/"));
