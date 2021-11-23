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

const COLLECTION_PATH_PROFILES = () => ["profiles"];
const DOCUMNENT_PATH_PROFILES = (userId: string) => [
  ...COLLECTION_PATH_PROFILES(),
  userId
];
const COLLECTION_PATH_PROFILES_FOLLOW = (userId: string) => [
  ...DOCUMNENT_PATH_PROFILES(userId),
  "follows"
];
const DOCUMENT_PATH_PROFILES_FOLLOW = (userId: string, twitterId: string) => [
  ...COLLECTION_PATH_PROFILES_FOLLOW(userId),
  twitterId
];

export const twitterCollectionRef = () =>
  collection(firebaseFirestore(), COLLECTION_PATH_TWITTERS().join("/"));
export const twitterDocumentRef = (id: string) =>
  doc(firebaseFirestore(), DOCUMNENT_PATH_TWITTERS(id).join("/"));
export const twitterLogCollectionRef = (id: string) =>
  collection(firebaseFirestore(), COLLECTION_PATH_TWITTERS_LOG(id).join("/"));

export const profileCollectionRef = () =>
  collection(firebaseFirestore(), COLLECTION_PATH_PROFILES().join("/"));
export const profileDocumentRef = (id: string) =>
  doc(firebaseFirestore(), DOCUMNENT_PATH_PROFILES(id).join("/"));
export const profileFollowCollectionRef = (id: string) =>
  collection(
    firebaseFirestore(),
    COLLECTION_PATH_PROFILES_FOLLOW(id).join("/")
  );
export const profileFollowDocumentRef = (userId: string, twitterId: string) =>
  doc(
    firebaseFirestore(),
    DOCUMENT_PATH_PROFILES_FOLLOW(userId, twitterId).join("/")
  );
