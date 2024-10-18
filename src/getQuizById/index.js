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

        console.log('quiz:', quizId)

        const quizParameters = {
            TableName: 'QuizTable2',
            KeyConditionExpression: 'quizId = :quizId',
            ExpressionAttributeValues: {
                ':quizId': quizId
            }
        }

        console.log('quiz:', quizId)

        console.log(quizParameters, 'tjena tjena')

        const result = await dynamoDb.query(quizParameters);
        
        const quiz = result.Items[0];

        console.log(quiz, 'quiz:')

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
        console.log(error, 'Tell me about it:')
        return sendError(500, error);
    }
}