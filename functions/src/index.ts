import * as functions from "firebase-functions";
import {TWITTER_BEARER_TOKEN} from "./local/config";
import TwitterApiClient from "./local/TwitterApiClient";

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async () => {
      const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
      const res = await client.showUser("fnobi");
      console.log("[followers_count]", res.followers_count);
      console.log("[friends_count]", res.friends_count);
    });
