const DynamoDB = require('aws-sdk/clients/dynamodb');

const DocumentClient = new DynamoDB.DocumentClient();

const { TWEETS_TABLE } = process.env;

const getTweetById = async (tweetId) => {
  const getTweetResponse = await DocumentClient.get({
    TableName: TWEETS_TABLE,
    Key: {
      id: tweetId
    }
  }).promise();

  return getTweetResponse.Item;
}

module.exports = {
  getTweetById 
};
