import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as express from "express";
import { TWITTER_BEARER_TOKEN, INHOUSE_API_TOKEN } from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";
import { TwitterAccount } from "./sync/scheme/TwitterAccount";
import { TwitterData } from "./sync/scheme/TwitterData";
import { TwitterEntry } from "./sync/scheme/TwitterEntry";

admin.initializeApp(functions.config().firebase);

const twitterCollectionRef = () =>
  admin.firestore().collection("twitters");

const twitterDocumentRef = (id: string) =>
  twitterCollectionRef().doc(id);

const twitterLogCollectionRef = (id: string) =>
  twitterDocumentRef(id).collection("log");

const entryCollectionRef = () =>
  admin.firestore().collection("entries");

const entryDocumentRef = (id: string) =>
  entryCollectionRef().doc(id);

async function writeTwitterLogData(
    client: TwitterApiClient,
    opts: {id:string}
) {
  const { id: name } = opts;
  if (!name) {
    return;
  }
  const res = await client.showUser(name);
  if (!res) {
    return;
  }
  const id = res.id_str;
  const entryRes = await client.showUserTweets(id);
  if (!entryRes) {
    return;
  }
  const d = new Date();
  const log: TwitterData = {
    createdAt: d.getTime(),
    followersCount: res.followers_count,
    friendsCount: res.friends_count,
    recentTweets: entryRes.data.map((t) => t.id),
    hours: d.getHours(),
    days: d.getDate()
  };
  const profile: Partial<TwitterAccount> = {
    id,
    name: res.name,
    iconUrl: res.profile_image_url_https
  };
  await Promise.all([
    twitterLogCollectionRef(opts.id).doc().set(log),
    twitterDocumentRef(opts.id).set(profile, { merge: true }),
    ...entryRes.data.map((e) =>{
      const ent: TwitterEntry = {
        id: e.id,
        text: e.text,
        createdAt: e.created_at,
        retweetCount: e.public_metrics.retweet_count,
        likeCount: e.public_metrics.like_count,
        replyCount: e.public_metrics.reply_count,
        quoteCount: e.public_metrics.quote_count
      };
      return entryDocumentRef(e.id).set(ent);
    })
  ]);
  return {
    log,
    profile,
    entries: [...entryRes.data]
  };
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

const apiApp = express();

apiApp.get("/tweet/:id", async (req, res) => {
  const { id } = req.params;
  const { key } = req.query;
  if (String(key) !== INHOUSE_API_TOKEN || !INHOUSE_API_TOKEN) {
    res.status(400).send({ status: "ng", error: "api token is not valid." });
    return;
  }
  if (!id) {
    res.send({ status: "ng", error: "no id." });
    return;
  }
  const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
  const result = await writeTwitterLogData(client, { id });
  if (!result) {
    res.send({ status: "ng", error: "api error." });
    return;
  }
  res.send({ status: "ok", id, result });
});

exports.api = functions.https.onRequest(apiApp);
