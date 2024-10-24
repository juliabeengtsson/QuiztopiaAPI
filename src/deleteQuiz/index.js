const { dynamoDb } = require('../../services/database');
const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const middy = require('@middy/core')
const jwtAuth = require('../middleware/jwtAuthorizer');
const { sendError, sendResponse } = require('../../services/response');

const deleteQuiz = async (event) => {
    const { quizId } = event.pathParameters; // Hämta quizId från URL:en

    if (!quizId) {
        return sendError(400, { message: 'Quiz ID is required' });
    }

    try {
        // Skicka en begäran för att ta bort quiz från DynamoDB
        await dynamoDb.send(
            new DeleteCommand({
                TableName: process.env.QUIZ_TABLE,
                Key: { quizId },
            })
        );

        return sendResponse(200, {
            message: 'Quiz successfully deleted.',
            quizId,
        });
    } catch (error) {
        return sendError(500, {
            message: 'Could not delete quiz.',
            error: JSON.stringify(error),
        });
    }
}

module.exports.deleteQuiz = middy(deleteQuiz).use(jwtAuth)