const chance = require('chance').Chance();

const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');

describe('Given user A and user B', () => {
  let userA;
  let userB;
  let userATweet1;
  let userATweet2;
  beforeAll(async () => {
    userA = await given.an_authenticated_user();
    userB = await given.an_authenticated_user();
    userATweet1 = await when.we_invoke_tweet(userA.username, chance.paragraph());
    userATweet2 = await when.we_invoke_tweet(userA.username, chance.paragraph());
  });

  describe('When user B follows user A', () => {
    beforeAll(async () => {
      const event = require('../../data/new-follower.json');
      const { NewImage } = event.Records[0].dynamodb;
      NewImage.userId.S = userB.username;
      NewImage.otherUserId.S = userA.username;
      NewImage.sk.S = `FOLLOWS_${userA.username}`;
      tweet = await when.we_invoke_distributeTweetsToFollower(event);
    });

    it("Adds user A's tweets to user B's timeline", async () => {
      await then.tweet_exists_in_TimelinesTable(userB.username, userATweet1.id);
      await then.tweet_exists_in_TimelinesTable(userB.username, userATweet2.id);
    });
  });

  describe('When user B unfollows user A', () => {
    const tweetId = chance.guid();
    beforeAll(async () => {
      const event = require('../../data/delete-follower.json');
      const { OldImage } = event.Records[0].dynamodb;
      OldImage.userId.S = userB.username;
      OldImage.otherUserId.S = userA.username;
      OldImage.sk.S = `FOLLOWS_${userA.username}`;
      tweet = await when.we_invoke_distributeTweetsToFollower(event);
    });

    it("Removes user A's tweets from user B's timeline", async () => {
      await then.tweet_does_not_exist_in_TimelinesTable(userB.username, userATweet1.id);
      await then.tweet_does_not_exist_in_TimelinesTable(userB.username, userATweet2.id);
    });
  });
});