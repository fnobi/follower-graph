import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {TWITTER_BEARER_TOKEN} from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";

admin.initializeApp(functions.config().firebase);

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      const rootRef = admin.firestore().collection("users");
      const users = await rootRef.get();
      await Promise.all(users.docs.map(async (snapshot) => {
        const {twitter: name} = snapshot.data();
        if (!name) {
          return;
        }
        const res = await client.showUser(name);
        const d = new Date();
        await snapshot.ref.collection("log").doc().set({
          createdAt: d.getTime(),
          followersCount: res.followers_count,
          friendsCount: res.friends_count,
          hours: d.getHours(),
          days: d.getDate(),
        });
      }));
    });
