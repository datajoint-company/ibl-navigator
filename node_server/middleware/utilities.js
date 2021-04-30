const config = require('../config')
const jwt = require('jsonwebtoken');
let cache = require('memory-cache');
let memCache = new cache.Cache();

module.exports = {
    memCache: memCache,
    checkAuth: (req, res, next) => {
        try {
            // // authorization token format: "Bearer aeralejlaiejrai212j1"
            // const token = req.headers.authorization.split(" ")[1];
            // // console.log('inside authCheck, token is: ', token);
            // jwt.verify(token, config.jwtSecret);
            next();
        } catch (error) {
            res.status(401).send({message: "authorization failed at checkAuth"});
        }
    },
    cacheMiddleware: (duration) => {
        return (req, res, next) => {
            let key =  (req.originalUrl || req.url) + '?base64=' + Buffer.from(
                JSON.stringify(req.body)).toString('base64')
            let cacheContent = module.exports['memCache'].get(key);
            if(cacheContent){
                res.send( cacheContent );
                return
            }else{
                res.sendResponse = res.send
                res.send = (body) => {
                    module.exports['memCache'].put(key,body,duration*1000);
                    res.sendResponse(body)
                }
                next()
            }
        }
    }
};