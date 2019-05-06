const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // authorization token format: "Bearer aeralejlaiejrai212j1"
        const token = req.headers.authorization.split(" ")[1];
        // console.log('inside authCheck, token is: ', token);
        jwt.verify(token, 'some-secret-value-needs-to-be-changed');
        next();
    } catch (error) {
        res.status(401).send({message: "authorization failed at checkAuth"});
    }
    
    
};