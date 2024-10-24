const { sendError, sendResponse } = require('../../services/response');
const middy = require('@middy/core');
const { dynamoDb } = require('../../services/database');
const { v4: uuidv4 } = require('uuid');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const jwtAuth = require('../middleware/jwtAuthorizer');

const createQuiz = async (event) => {
    try {
        const { quizName, questions } = JSON.parse(event.body);

        // Hämta användarens id från den verifierade JWT-token
        const { userId } = event.requestContext.authorizer;

        if (!quizName || !questions) {
            return sendResponse(400, { message: 'Please fill in the required forms' });
        }

        // Kontrollera om quiz-namnet redan finns
        const checkQuiz = {
            TableName: process.env.QUIZ_TABLE,
            FilterExpression: 'quizName = :quizName',
            ExpressionAttributeValues: {
                ':quizName': quizName
            }
        };

        const scanResult = await dynamoDb.scan(checkQuiz);
        if (scanResult.Items.length > 0) {
            return sendResponse(400, { message: 'That quiz name is already taken' });
        }

        // Skapa nytt quiz
        const quizId = uuidv4();
        const createdAt = new Date().toISOString();

        const createQuizParams = {
            TableName: process.env.QUIZ_TABLE,
            Item: {
                quizId,
                userId,
                quizName,
                questions,
                createdAt
            }
        };

        const putCommand = new PutCommand(createQuizParams);
        await dynamoDb.send(putCommand);
        console.log("Successfully inserted into DynamoDB:", createQuizParams.Item);

        return sendResponse(201, { message: 'Quiz created successfully', quizId });

    } catch (error) {
        return sendError(500, { message: 'An error occurred', error });
    }
};

module.exports.createQuiz = middy(createQuiz).use(jwtAuth);
