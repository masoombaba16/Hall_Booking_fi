const jwt = require('jsonwebtoken');
const asyncErrorHandle = require('express-async-handler');

// Middleware to verify token with role-based access
const verifyToken = (roles = []) => (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).send({ message: 'Access denied. No token provided.' });
    }

    try {
        // Decode token
        const decoded = jwt.verify(token, 'abcd'); // Replace 'abcd' with your secret key
        req.user = decoded; 
        req.user.token=token;// Attach user data to the request object

        // If roles are specified, check user role
        if (roles.length > 0 && !roles.includes(decoded.userType)) {
            return res.status(403).send({ message: 'Forbidden: Unauthorized access.' });
        }

        // Proceed to the next middleware/handler
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'Token has expired.' });
        }
        return res.status(400).send({ message: 'Invalid or expired token.' });
    }
};

// Middleware to validate token and username match
const validateToken = () => asyncErrorHandle((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Decode and verify token
        const secretKey = 'abcd'; // Replace with process.env.JWT_SECRET in production
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Attach user data to the request object

        const requestUsername = req.body.username || req.params.username; // Extract username from request
        if (!requestUsername) {
            return res.status(400).json({ message: 'Username is required in the request.' });
        }

        // Check if token username matches request username
        if (decoded.username !== requestUsername) {
            return res.status(403).json({ message: 'Username mismatch: Unauthorized access.' });
        }

        // If roles are specified, check if the user has the required role
        next(); // Proceed to the next middleware
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        } else if (error.name === 'JsonWebTokenError') {
            console.error('Error validating token:', error.message);
            return res.status(400).json({ message: 'Invalid token.' });
        } else {
            console.error('Unexpected token validation error:', error);
            return res.status(500).json({ message: 'An internal error occurred during token validation.' });
        }
    }
});

module.exports = { verifyToken, validateToken };
