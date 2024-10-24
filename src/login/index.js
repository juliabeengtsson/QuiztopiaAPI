const { dynamoDb } = require('../../services/database');
const { sendError, sendResponse } = require('../../services/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.login = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body);

        if(!username || !password) {
            return sendResponse(400, 'Username and password are required')
        }

        // Kollar om användarnamnet finns i databasen
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

        // if statement ifall användaren finns i databasen
        if(result.Items.length === 0) {
            return sendResponse(400, 'Invalid username or password')
        }

        // Hämta användarens hashade lösenord från databasen
        const user = result.Items[0];
        const hashPassword = user.hashPassword;

        // kolla om lösenordet är samma som de hashade lösenordet i databasen
        const isPasswordValid = await bcrypt.compare(password, hashPassword);

        if (!isPasswordValid) {
            return sendResponse(400, { message: 'Invalid username or password' });
        }

        // Om lösenordet är korrekt, generera en JWT-token
        const token = jwt.sign(
            { userId: user.userId, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return sendResponse(201, 'Login sucessfull', token)

    } catch(error) {
        return sendError(500, error);
    }
}