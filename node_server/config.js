require('dotenv').config();

const config = {
    demoUsername: process.env.DEMO_USERNAME,
    demoPassword: process.env.DEMO_PASSWORD,
    jwtSecret: process.env.JWT_SECRET
};

if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
    console.log('Production environment:');
    // config.port = 5555;
} else if (process.env.NODE_ENV && process.env.NODE_ENV === "demo") {
    // configure internal demo environment
    console.log('Internal Demo environment')
    // config.port = 5678;
} else {
    console.log('Development environment:')
    // config.port = 5555
}
module.exports = config;