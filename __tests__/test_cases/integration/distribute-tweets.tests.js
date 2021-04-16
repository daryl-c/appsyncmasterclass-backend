const chance = require('chance').Chance();

const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');

describe('Given user A follows user B', () => {
  let userA;
  let userB;
  beforeAll(async () => {
    userA = await given.an_authenticated_user();
    userB = await given.an_authenticated_user();
    await given.a_user_follows_another(userA.username, userB.username);
  });

  describe('When user B sends a tweet', () => {
    const tweetId = chance.guid();
    beforeAll(async () => {
      const event = require('../../data/new-tweet.json');
      const { NewImage } = event.Records[0].dynamodb;
      NewImage.creator.S = userB.username;
      NewImage.id.S = tweetId;
      tweet = await when.we_invoke_distributeTweets(event);
    });

    it("Adds user B's tweet to user A's timeline", async () => {
      await then.tweet_exists_in_TimelinesTable(userA.username, tweetId);
    });
  });

  describe('When user B deletes a tweet', () => {
    const tweetId = chance.guid();
    beforeAll(async () => {
      const event = require('../../data/delete-tweet.json');
      const { OldImage } = event.Records[0].dynamodb;
      OldImage.creator.S = userB.username;
      OldImage.id.S = tweetId;
      tweet = await when.we_invoke_distributeTweets(event);
    });

    it("Removes user B's tweet to user A's timeline", async () => {
      await then.tweet_does_not_exist_in_TimelinesTable(userA.username, tweetId);
    });
  });
});