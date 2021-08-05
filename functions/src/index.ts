import * as functions from "firebase-functions";
import got from "got";
import {TWITTER_BEARER_TOKEN} from "./local/config";

const API_ORIGIN = "https://api.twitter.com";

const callTwitterApi = (
    path: string,
    searchParams: {[key:string]:string}
) => got
    .get(`${API_ORIGIN}${path}`, {
      searchParams,
      headers: {
        "Authorization": `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

const searchRecentTweet = (query:string) =>
  callTwitterApi(
      "/2/tweets/search/recent",
      {
        query,
      }
  ).json();

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async () => {
      const res = await searchRecentTweet("from:twitterdev");
      console.log(JSON.stringify(res));
    });
