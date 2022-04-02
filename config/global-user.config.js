module.exports = (req, res, next) => {
    // in the moment when user logs in, we save user object inside req.session
    // this currentUser is then available in any route where we have access to "request"
    res.locals.userInSession = req.session.currentUser;

    //userInSession now became global variable

    next()
}