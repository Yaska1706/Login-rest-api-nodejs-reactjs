//generate token using secret key from process.env.JWT_SECRET
const jwt = require('jsonwebtoken')

//generate token and return it
function generateToken(user) {
    if (!user) 
        return null

    var u = {
        userId: user.userId,
        name: user.name,
        username: user.username,
        isAdmin: user.isAdmin
    };

    return jwt.sign(u, process.env.JWT_SECRET,{
        expiresIn: 60*60*12 //token expires in 12hrs
    });
}

//function to return details
function getCleanUser(user){
    if (!user) return null

    return {
        userId: user.userId,
        name: user.name,
        username: user.username,
        isAdmin: user.isAdmin
    }
}

module.exports = {
    generateToken,
    getCleanUser
}