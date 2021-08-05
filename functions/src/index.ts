import * as functions from "firebase-functions";
import got from "got";
import {TWITTER_BEARER_TOKEN} from "./local/config";


class TwitterApiClient {
    private static API_ORIGIN = "https://api.twitter.com";

    private bearerToken: string;

    public constructor(bearerToken: string) {
        this.bearerToken = bearerToken;
    }

    private callApi (
        path: string,
        searchParams: {[key:string]:string}
    ) {
        return got
            .get(`${TwitterApiClient.API_ORIGIN}${path}`, {
                searchParams,
                headers: {
                    "Authorization": `Bearer ${this.bearerToken}`,
                },
            })
            .json();
    }

    public searchRecentTweet  (query:string) {
        return this.callApi(
            "/2/tweets/search/recent",
            {
                query,
            }
        );
    }

    public showUser (screenName:string) {
        return this.callApi(
            "/1.1/users/show.json",
            {
                screen_name: screenName,
            }
        );
    }
}

exports.scheduleFetchFollowers = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async () => {
        const client = new TwitterApiClient(TWITTER_BEARER_TOKEN);
        const res = await client.showUser('fnobi');
        console.log(res);
    });
