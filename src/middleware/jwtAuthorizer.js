const jwt = require('jsonwebtoken');
const { sendResponse, sendError} = require('../../services/response');

// Authorizer function to validate JWT token
module.exports.jwtAuth = async (event) => {
  // Hämta token från Authorization-headern (hanterar både gemener och versaler)
  const token = event.headers.Authorization || event.headers.authorization;

  // Om ingen token tillhandahålls, returnera en 401 Unauthorized
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized: No token provided' }),
    };
  }

  try {
    // Rensa 'Bearer' prefixet om det finns
    const cleanedToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    // Verifiera JWT-tokenen med den hemliga nyckeln från miljövariabeln
    const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);

    // Returnera en framgångssignal om token är giltig och inkludera decoded användardata
    return sendResponse(201, 'Authorized', decoded);

  } catch (error) {
    // Om verifieringen misslyckas, returnera ett generellt felmeddelande utan att läcka detaljer
    return sendError(401, 'Invalid token', error);
  }
};
