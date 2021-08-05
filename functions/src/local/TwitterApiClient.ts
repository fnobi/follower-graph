import got from "got";

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
    friends_count: number
};

export default class TwitterApiClient {
    private static API_ORIGIN = "https://api.twitter.com";

    private bearerToken: string;

    public constructor(bearerToken: string) {
      this.bearerToken = bearerToken;
    }

    private callApi<T=unknown>(
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
          .json<T>();
    }

    public searchRecentTweet(query:string): Promise<unknown> {
      return this.callApi(
          "/2/tweets/search/recent",
          {
            query,
          }
      );
    }

    public showUser(screenName:string): Promise<TwitterUserObject> {
      return this.callApi<TwitterUserObject>(
          "/1.1/users/show.json",
          {
            screen_name: screenName,
          }
      );
    }
}
