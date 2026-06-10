const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.headers.authorization;

    // Check agar token Bearer format mein aa raha hai (e.g., "Bearer <token>")
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1]; // Sirf token string nikalenge

            // Token verify karein
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Request object mein user data attach karein taaki controller ise use kar sake
            req.user = decoded; 
            
            next(); // Agle function par jao
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};

module.exports = { protect };