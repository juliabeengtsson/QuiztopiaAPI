//const AWS = require('aws-sdk');
const { dynamoDb } = require('../../services/database');
const { sendError, sendResponse } = require('../../services/response');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

exports.handler = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body);

        if(!username || !password) {
            return sendResponse(400, 'Username and password are required')
        }

        // Kollar ifall användarnamnet redan finns i databasen
        const checkParams = {
            TableName: process.env.USERS_TABLE,
            IndexName: 'UsernameIndex',
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username,
            },
        };

        const command = new QueryCommand(checkParams);
        const result = await dynamoDb.send(command);

        if (result.Items.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Username already exists' }),
            };
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const params = {
            TableName: process.env.USERS_TABLE,
            Item: {
              userId,
              username,
              hashPassword,
            }
        };

        const putCommand = new PutCommand(params);
        await dynamoDb.send(putCommand);

        return sendResponse(201, {message: 'User created', userId})
 
    } catch(error) {
        return sendError(500, error);
    }
};