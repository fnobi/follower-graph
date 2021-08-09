import * as functions from "firebase-functions";

const {
  bearer_token: TWITTER_BEARER_TOKEN
} = functions.config().twitter || {};

export {
  TWITTER_BEARER_TOKEN
};
