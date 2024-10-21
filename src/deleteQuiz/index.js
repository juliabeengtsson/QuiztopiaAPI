const { dynamoDb } = require('../../services/database');
const middy = require('@middy/core')
const jwtAuth = require('../middleware/jwtAuthorizer');

const deleteQuiz = async (event) => {
    try {
        const { userId, quizId } = event.pathParameters;

        if (!userId || !quizId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Please provide both userId and quizId in the URL'
                })
            }
        }

        const getParams = {
            TableName: 'QuizTable2',
            Key: {
                userId: userId, 
                quizId: quizId   
            }
        }

        const result = await dynamoDb.get(getParams);
        const quiz = result.Item;

        if (!quiz) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Quiz not found'
                })
            }
        }

        const deleteParams = {
            TableName: 'QuizTable2',
            Key: {
                userId: userId,  
                quizId: quizId   
            }
        }

        await dynamoDb.delete(deleteParams);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Quiz deleted successfully'
            })
        }

    } catch (error) {
        console.log(error, 'tell me:')
        return sendError(500, { message: 'An error occurred', error });
    }
}

module.exports.deleteQuiz = middy(deleteQuiz).use(jwtAuth)