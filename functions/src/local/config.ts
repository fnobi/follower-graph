import * as functions from "firebase-functions";

const {
  bearer_token: TWITTER_BEARER_TOKEN
} = functions.config().twitter || {};

const {
  token: INHOUSE_API_TOKEN
} = functions.config().inhouse_api || {};

export {
  TWITTER_BEARER_TOKEN,
  INHOUSE_API_TOKEN
};
