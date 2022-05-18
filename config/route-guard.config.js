
    
    //what happens if user is logged
    //what user can do if they are logged in 

    const isLoggedIn = (req, res, next) => {
        if(!req.session.currentUser){
            return res.redirect("/profile");   
        }
        next()
    }

    //what user can do if they are logged out


    const isLoggedOut = (req, res, next) => {
        //if is not logged in
        console.log(req.session.currentUser)
        if(req.session.currentUser){
            return res.redirect("/")
        }
        next()
    }

    module.exports = {
        isLoggedIn,
        isLoggedOut
    }