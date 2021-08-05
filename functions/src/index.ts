import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {TWITTER_BEARER_TOKEN} from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";

admin.initializeApp(functions.config().firebase);

const USER_LIST = ["fnobi"];

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async () => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      await Promise.all(USER_LIST.map(async (name) => {
        const res = await client.showUser(name);
        await admin.firestore().collection(name).doc().set({
          createdAt: Date.now(),
          followersCount: res.followers_count,
          friendsCount: res.friends_count,
        });
      }));
    });
