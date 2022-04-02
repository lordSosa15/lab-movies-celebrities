const session = require("express-session");

const MongoStore = require("connect-mongo");

const mongoose = require("mongoose")

module.exports = (app) => { //app is a place holder

    app.set('trust proxy', 1) // important in deployment

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60000 // 60 * 1000 ms === 1 min  BANK is usually 10 mins 
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/lab-movies-celebrities'
 
        // ttl => time to live
        // ttl: 60 * 60 * 24 // 60sec * 60min * 24h => 1 day
    })
}))
}