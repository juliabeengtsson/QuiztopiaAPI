const { dynamoDb } = require('../../services/database');
const { sendError } = require('../../services/response');

exports.getQuizById = async (event) => {
    try {
        const { quizId } = event.pathParameters;

        if (!quizId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Fill in the correct URL'
                })
            }
        }

        const quizParameters = {
            TableName: 'QuizTable2',
            KeyConditionExpression: 'quizId = :quizId',
            ExpressionAttributeValues: {
                ':quizId': quizId
            }
        }

        const result = await dynamoDb.query(quizParameters);
        
        const quiz = result.Items[0];

        if (!quiz) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Could not find any quiz with that ID for the specified user'
                })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Your specific quiz:`,
                quiz: quiz
            })
        }

    } catch(error) {
        return sendError(500, error);
    }
}