const { dynamoDb } = require('../../services/database');
const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const middy = require('@middy/core');
const jwtAuth = require('../middleware/jwtAuthorizer');
const { sendError, sendResponse } = require('../../services/response');

const postQuestion = async (event) => {
    const { quizId } = event.pathParameters;
    if (!quizId) {
        return sendError(400, { message: 'Quiz Id is required' });
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return sendError(400, { message: 'Invalid request body' });
    }

    const { questionText, answer, longitude, latitude } = body;

    // Kontrollera att alla nödvändiga fält finns
    if (!questionText || !answer || !longitude || !latitude) {
        return sendError(400, { message: 'All fields (questionText, answer, longitude, latitude) are required' });
    }

    try {
        const newQuestion = {
            questionText,
            answer,
            longitude,
            latitude,
        };

        await dynamoDb.send(
            new UpdateCommand({
                TableName: process.env.QUIZ_TABLE,
                Key: { quizId }, // Kontrollera att quizId är en korrekt nyckel i DynamoDB-tabellen
                UpdateExpression:
                    'SET questions = list_append(if_not_exists(questions, :emptyList), :newQuestion)',
                ExpressionAttributeValues: {
                    ':newQuestion': [newQuestion], // Lägg till nya frågan som ett objekt
                    ':emptyList': [], // Skapa en tom lista om listan inte existerar
                },
                ReturnValues: 'UPDATED_NEW',
            })
        );

        return sendResponse(200, {
            message: 'Question successfully added to the quiz.',
            quizId,
        });
    } catch (error) {
        return sendError(500, {
            message: 'Could not add question to quiz.',
            error: JSON.stringify(error),
        });
    }
};

module.exports.postQuestion = middy(postQuestion).use(jwtAuth);
