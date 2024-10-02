const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDB({
    region: process.env.AWS_REGION
})

const dynamoDb = DynamoDBDocument.from(client)

module.exports = { dynamoDb }