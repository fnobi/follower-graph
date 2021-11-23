import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { TWITTER_BEARER_TOKEN } from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";
import { TwitterData } from "./sync/scheme/TwitterData";

admin.initializeApp(functions.config().firebase);

const twitterCollectionRef = () =>
  admin.firestore().collection("twitters");

const twitterDocumentRef = (id: string) =>
  twitterCollectionRef().doc(id);

const twitterLogCollectionRef = (id: string) =>
  twitterDocumentRef(id).collection("log");

async function writeTwitterLogData(
    client: TwitterApiClient,
    snapshot: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData
    >
) {
  const { id: name } = snapshot;
  if (!name) {
    return;
  }
  const res = await client.showUser(name);
  const d = new Date();
  const t: TwitterData = {
    createdAt: d.getTime(),
    followersCount: res.followers_count,
    friendsCount: res.friends_count,
    hours: d.getHours(),
    days: d.getDate()
  };
  await twitterLogCollectionRef(snapshot.id).doc().set(t);
}

exports.scheduleFetchTwitterFollowers = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      const users = await twitterCollectionRef().get();
      await Promise.all(users.docs.map((snapshot) =>
        writeTwitterLogData(client, snapshot)
      ));
    });

exports.handleTwitterCreate = functions.firestore
    .document("twitters/{twitterId}")
    .onCreate(async (snapshot) => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      await writeTwitterLogData(client, snapshot);
    });

exports.handleTwitterDelete = functions.firestore
    .document("twitters/{twitterId}")
    .onDelete(async (snapshot) => {
      const col = await snapshot.ref.collection("log").get();
      return Promise.all(col.docs.map((item) => item.ref.delete()));
    });
