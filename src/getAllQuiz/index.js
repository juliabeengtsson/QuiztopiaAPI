
const { dynamoDb } = require('../../services/database');
const { sendError } = require('../../services/response');

exports.getAllQuiz = async (event) => {
    try {

        const quizTableParams = {
            TableName: 'QuizTable2'
        }

        const result = await dynamoDb.scan(quizTableParams)
        const allQuiz = result.Items

        if(!allQuiz) {
            return sendError(404, 'No quiz found in database');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'All quiz in the database: ',
                quiz: allQuiz
            })
        }

    } catch(error) {
        return sendError(500, error);
    }
}