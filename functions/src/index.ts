import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {TWITTER_BEARER_TOKEN} from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";

admin.initializeApp(functions.config().firebase);

const USER_LIST = ["fnobi"];

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      await Promise.all(USER_LIST.map(async (name) => {
        const res = await client.showUser(name);
        const d = new Date();
        await admin.firestore().collection(name).doc().set({
          createdAt: d.getTime(),
          followersCount: res.followers_count,
          friendsCount: res.friends_count,
          hours: d.getHours(),
          days: d.getDate(),
        });
      }));
    });
