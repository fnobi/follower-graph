import axios from "axios";

type TwitterUserObject = {
    id: number;
    // eslint-disable-next-line camelcase
    id_str: string;
    name: string;
    // eslint-disable-next-line camelcase
    screen_name: string;
    // eslint-disable-next-line camelcase
    followers_count: number;
    // eslint-disable-next-line camelcase
    friends_count: number,
    // eslint-disable-next-line camelcase
    profile_image_url_https: string
};

type TwitterEntryObject = {
  id:string;
  text:string;
    // eslint-disable-next-line camelcase
  created_at:string;
};

export default class TwitterApiClient {
    private static API_ORIGIN = "https://api.twitter.com";

    private bearerToken: string;

    public constructor(bearerToken: string) {
      this.bearerToken = bearerToken;
    }

    private async callApi<T=unknown>(
        path: string,
        params: {[key:string]:string} = {}
    ) {
      const res = await axios.get<T>(`${TwitterApiClient.API_ORIGIN}${path}`, {
        params,
        headers: {
          "Authorization": `Bearer ${this.bearerToken}`
        }
      }).catch((e) => {
        console.error(JSON.stringify(e.response));
        return null;
      });
      return res ? res.data : null;
    }

    public searchRecentTweet(query:string) {
      return this.callApi(
          "/2/tweets/search/recent",
          {
            query
          }
      );
    }

    public showUser(screenName:string) {
      return this.callApi<TwitterUserObject>(
          "/1.1/users/show.json",
          {
            screen_name: screenName
          }
      );
    }

    public showUserTweets(id:string) {
      return this.callApi<{data: TwitterEntryObject[]}>(
          `/2/users/${id}/tweets`,
          {
            "tweet.fields": "created_at",
            "exclude": "retweets,replies"
          }
      );
    }
}
