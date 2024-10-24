require('dotenv').config()
const jwt = require('jsonwebtoken')

const jwtAuth = {
  before: async (handler) => {

    const token = handler.event.headers.Authorization || handler.event.headers.authorization
    console.log(handler.event, 'handler.event.headers');

    if (!token) {
      throw new Error('Access denied. No token provided.')
    }

    try {
      const cleanToken = token.replace('Bearer ', '').trim()

      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

      handler.event.requestContext.authorizer = decoded;

      console.log('Token är giltig:', decoded);

      handler.event.user = decoded

      return;

    } catch (error) {
      console.error(error)
      throw new Error('Invalid token.')
    }
  }
};

module.exports = jwtAuth;