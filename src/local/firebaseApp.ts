import firebase from "firebase/app";
import "firebase/firestore";
import firebaseConfig from "~/local/firebaseConfig";

const FIREBASE_NAME = "follower-graph";

const getApp = (): firebase.app.App =>
  firebase.apps.find(a => a.name === FIREBASE_NAME) ||
  firebase.initializeApp(firebaseConfig, FIREBASE_NAME);

export const firebaseAuth = () => getApp().auth();
export const firebaseFirestore = () => getApp().firestore();
