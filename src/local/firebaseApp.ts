import { getApps as getCurrentApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "~/local/firebaseConfig";

const FIREBASE_NAME = "follower-graph";

const getApp = () =>
  getCurrentApps().find(a => a.name === FIREBASE_NAME) ||
  initializeApp(firebaseConfig, FIREBASE_NAME);

export const firebaseAuth = () => getAuth(getApp());
export const firebaseFirestore = () => getFirestore(getApp());
