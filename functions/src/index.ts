import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {TWITTER_BEARER_TOKEN} from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";

admin.initializeApp(functions.config().firebase);

const accountCollectionRef = () =>
  admin.firestore().collection("users");

const accountDocumentRef = (id: string) =>
  accountCollectionRef().doc(id);

const accountLogCollectionRef = (id: string) =>
  accountDocumentRef(id).collection("log");

async function writeLogData(
    client: TwitterApiClient,
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData
    >
) {
  const {twitter: name} = snapshot.data();
  if (!name) {
    return;
  }
  const res = await client.showUser(name);
  const d = new Date();
  await accountLogCollectionRef(snapshot.id).doc().set({
    createdAt: d.getTime(),
    followersCount: res.followers_count,
    friendsCount: res.friends_count,
    hours: d.getHours(),
    days: d.getDate(),
  });
}

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      const users = await accountCollectionRef().get();
      await Promise.all(users.docs.map((snapshot) =>
        writeLogData(client, snapshot)
      ));
    });

exports.handleUserCreate = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snapshot) => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      await writeLogData(client, snapshot);
    });

exports.handleUserDelete = functions.firestore
    .document("users/{userId}")
    .onDelete(async (snapshot) => {
      const col = await snapshot.ref.collection("log").get();
      return Promise.all(col.docs.map((item) => item.ref.delete()));
    });
