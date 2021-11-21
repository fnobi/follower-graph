import { collection, doc } from "firebase/firestore";
import { firebaseFirestore } from "./firebaseApp";

const COLLECTION_PATH_TWITTERS = () => ["twitters"];
const DOCUMNENT_PATH_TWITTERS = (userId: string) => [
  ...COLLECTION_PATH_TWITTERS(),
  userId
];
const COLLECTION_PATH_TWITTERS_LOG = (userId: string) => [
  ...DOCUMNENT_PATH_TWITTERS(userId),
  "log"
];

export const twitterCollectionRef = () =>
  collection(firebaseFirestore(), COLLECTION_PATH_TWITTERS().join("/"));
export const twitterDocumentRef = (id: string) =>
  doc(firebaseFirestore(), DOCUMNENT_PATH_TWITTERS(id).join("/"));
export const twitterLogCollectionRef = (id: string) =>
  collection(firebaseFirestore(), COLLECTION_PATH_TWITTERS_LOG(id).join("/"));
