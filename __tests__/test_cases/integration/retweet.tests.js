const chance = require('chance').Chance();

const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');

describe('Given an authenticated user with a tweet', () => {
    let userWithTweet;
    let tweet;
    const text = chance.string({ length: 16 });
    beforeAll(async () => {
      userWithTweet = await given.an_authenticated_user();
      tweet = await when.we_invoke_tweet(userWithTweet.username, text);
    });

    describe('When they retweet their own tweet', () => {
      beforeAll(async () => {
        await when.we_invoke_retweet(userWithTweet.username, tweet.id);
      });

      it('Saves the retweet in the Tweets table', async () => {
        await then.retweet_exists_in_TweetsTable(userWithTweet.username, tweet.id);
      });

      it('Saves the retweet in the Retweets table', async () => {
        await then.retweet_exists_in_RetweetsTable(userWithTweet.username, tweet.id);
      });

      it('Increments the retweets count in the Tweets table', async () => {
        const { retweets } = await then.tweet_exists_in_TweetsTable(tweet.id);

        expect(retweets).toEqual(1);
      });

      it('Increments the retweets count in the Users table', async () => {
        await then.tweetsCount_is_updated_in_UsersTable(userWithTweet.username, 2);
      });

      it("Doesn't save the retweet in the Timelines table", async () => {
        const tweets = await then.there_are_N_tweets_in_TimelinesTable(userWithTweet.username, 1);

        expect(tweets[0].tweetId).toEqual(tweet.id);
      });
    });

    describe("When they retweet another user's tweet", () => {
      let userB;
      let anotherTweet;
      const text = chance.string({ length: 16 });
      beforeAll(async () => {
        userB = await given.an_authenticated_user();
        anotherTweet = await when.we_invoke_tweet(userB.username, text);
        await when.we_invoke_retweet(userWithTweet.username, anotherTweet.id);
      });

      it('Saves the retweet in the Tweets table', async () => {
        await then.retweet_exists_in_TweetsTable(userWithTweet.username, anotherTweet.id);
      });

      it('Saves the retweet in the Retweets table', async () => {
        await then.retweet_exists_in_RetweetsTable(userWithTweet.username, anotherTweet.id);
      });

      it('Increments the retweets count in the Tweets table', async () => {
        const { retweets } = await then.tweet_exists_in_TweetsTable(anotherTweet.id);

        expect(retweets).toEqual(1);
      });

      it('Increments the retweets count in the Users table', async () => {
        await then.tweetsCount_is_updated_in_UsersTable(userWithTweet.username, 3);
      });

      it("Saves the retweet in the Timelines table", async () => {
        const tweets = await then.there_are_N_tweets_in_TimelinesTable(userWithTweet.username, 2);

        expect(tweets[0].retweetOf).toEqual(anotherTweet.id);
        expect(tweets[1].tweetId).toEqual(tweet.id);
      });
    });
});