require('dotenv').config();
const AWS = require('aws-sdk');
const http = require('axios');
const _ = require('lodash');
const fs = require('fs');

const user_exists_in_UsersTable = async (id) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.USERS_TABLE,
        Key: {
            id
        }
    }).promise();

    expect(resp.Item).toBeTruthy();

    return resp.Item;
};

const user_can_upload_image_to_url = async (url, filepath, contentType) => {
    const data = fs.readFileSync(filepath); 
    await http({
        method: 'put',
        url,
        headers: {
            'Content-Type': contentType
        },
        data
    });

    console.log('uploaded image to ', url);
}

const user_can_download_image_from = async (url) => {
    const response = await http(url);

    console.log('downloaded image from ', url);

    return response.data;
}

const tweet_exists_in_TweetsTable = async (id) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for tweet [${id}] in table [${process.env.TWEETS_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.TWEETS_TABLE,
        Key: {
            id
        }
    }).promise();

    expect(resp.Item).toBeTruthy();

    return resp.Item;
};

const tweet_exists_in_TimelinesTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for tweet [${tweetId}] for user [${userId}] in table [${process.env.TIMELINES_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.TIMELINES_TABLE,
        Key: {
            userId,
            tweetId 
        }
    }).promise();

    expect(resp.Item).toBeTruthy();

    return resp.Item;
};

const tweet_does_not_exist_in_TimelinesTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for tweet [${tweetId}] for user [${userId}] in table [${process.env.TIMELINES_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.TIMELINES_TABLE,
        Key: {
            userId,
            tweetId 
        }
    }).promise();

    expect(resp.Item).not.toBeTruthy();

    return resp.Item;
};

const retweet_exists_in_TweetsTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for retweet of [${tweetId}] in table [${process.env.TWEETS_TABLE}]`);
    const resp = await DynamoDB.query({
        TableName: process.env.TWEETS_TABLE,
        IndexName: 'retweetsByCreator',
        KeyConditionExpression: 'creator = :creator AND retweetOf = :tweetId',
        ExpressionAttributeValues: {
            ':creator': userId,
            ':tweetId': tweetId
        },
        Limit: 1
    }).promise();
    
    const retweet = _.get(resp, 'Items.0');

    expect(retweet).toBeTruthy();

    return retweet;
};

const retweet_does_not_exist_in_TweetsTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for retweet of [${tweetId}] in table [${process.env.TWEETS_TABLE}]`);
    const resp = await DynamoDB.query({
        TableName: process.env.TWEETS_TABLE,
        IndexName: 'retweetsByCreator',
        KeyConditionExpression: 'creator = :creator AND retweetOf = :tweetId',
        ExpressionAttributeValues: {
            ':creator': userId,
            ':tweetId': tweetId
        },
        Limit: 1
    }).promise();
    
    expect(resp.Items).toHaveLength(0);

    return null;
};

const there_are_N_tweets_in_TimelinesTable = async (userId, count) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for [${count}] tweets for user [${userId}] in table [${process.env.TIMELINES_TABLE}]`);
    const resp = await DynamoDB.query({
        TableName: process.env.TIMELINES_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    }).promise();

    expect(resp.Items).toHaveLength(count);

    return resp.Items; 
}

const retweet_exists_in_RetweetsTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for retweet [${tweetId}] in table [${process.env.RETWEETS_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.RETWEETS_TABLE,
        Key: {
            userId,
            tweetId
        }
    }).promise();

    expect(resp.Item).toBeTruthy();
    return resp.Item;
};

const retweet_does_not_exist_in_RetweetsTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for retweet [${tweetId}] in table [${process.env.RETWEETS_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.RETWEETS_TABLE,
        Key: {
            userId,
            tweetId
        }
    }).promise();

    expect(resp.Item).not.toBeTruthy();
    return resp.Item;
};

const tweetsCount_is_updated_in_UsersTable = async (id, newCount) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
    const resp = await DynamoDB.get({
        TableName: process.env.USERS_TABLE,
        Key: {
            id
        }
    }).promise();

    expect(resp.Item).toBeTruthy();
    expect(resp.Item.tweetsCount).toBe(newCount);

    return resp.Item;
};

const reply_exists_in_TweetsTable = async (userId, tweetId) => {
    const DynamoDB = new AWS.DynamoDB.DocumentClient();

    console.log(`looking for reply by [${userId}] to [${tweetId}] in table [${process.env.TWEETS_TABLE}]`);
    const resp = await DynamoDB.query({
        TableName: process.env.TWEETS_TABLE,
        IndexName: 'repliesForTweet',
        KeyConditionExpression: 'inReplyToTweetId = :tweetId',
        ExpressionAttributeValues: {
            ':tweetId': tweetId,
            ':userId': userId
        },
        FilterExpression: 'creator = :userId'
    }).promise();
    
    const reply = _.get(resp, 'Items.0');

    expect(reply).toBeTruthy();

    return reply;
};

module.exports = {
    user_exists_in_UsersTable,
    user_can_upload_image_to_url,
    user_can_download_image_from,
    tweet_exists_in_TweetsTable,
    tweet_exists_in_TimelinesTable,
    tweet_does_not_exist_in_TimelinesTable,
    retweet_exists_in_TweetsTable,
    retweet_does_not_exist_in_TweetsTable,
    retweet_exists_in_RetweetsTable,
    retweet_does_not_exist_in_RetweetsTable,
    reply_exists_in_TweetsTable,
    tweetsCount_is_updated_in_UsersTable,
    there_are_N_tweets_in_TimelinesTable,
}