require('dotenv').config();


const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./util');


const app = express(),
 port = process.env.PORT || 3000;

 //user static data
const userData = {
    userId: '001',
    password: '123456',
    name: 'testuser',
    username: 'test',
    isAdmin: true
};


//enable CORS
app.use(cors()) 
//parse application/json
app.use(bodyParser.json())
//parse application
app.use(bodyParser.urlencoded({ extended: true }))

//implementing middleware to validate the token
app.use((req, res, next)=>{
    //check header or url parameters or post parameters are token
    let token = req.headers['authorization'];
    if (!token)
        return next();//if no token, continue

    token = token.replace('Bearer', '')
    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if (err){
            return res.status(401).json({
                error: true,
                message: 'invalid user'
            })
        }
        else{
            //set the user to req so other routes can use it
            req.user = user;
            next();
        }
    })
})

//request handler
app.get('/' ,(req, res) =>{
    if (!req.user) 
        return res.status(401).json({ success: false, 
            message: 'Invalid user to access it.' 
        });
    res.send('Welcome' + req.user.name)
})

app.post('/users/signin', (req, res)=>{
    const user = req.body.username
    const pwd = req.body.password

    //return 400 status if username does not exist
    if (!user || !pwd){
        return res.status(400).json({
            error: true,
            message: 'username and password required'
        });
    }

    //return 401 status if credentials is not match
    if (user !== userData.username || pwd !== userData.password){
        return res.status(401).json({
            error: true,
            message: 'username or password is incorrect'
        });
    }

    //generate token
    const token = utils.generateToken(userData)
    //get user details
    const userObj = utils.getCleanUser(userData)

    //return token with details
    return res.json({
        user:userObj, token
    })
})

//verify token and return if its valid
app.get('/verifytoken', (req, res)=>{

    //check header or url parameters or post parameters for token
    let token = req.query.token
    if (!token){
        return res.status(400).json({
            error: true,
            message: 'Token is required'
        })
    }
    //check token by decoding the token using secret
    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        //return 401 if token does not exist
        if (err) {
            return res.status(401).json({
                error: true,
                message: 'invalid token'
            })
        }    
        //return 401 status if the userId does not match
        if (user.userId !== userData.userId){
            return res.status(401).json({
                error: true,
                message: 'Invalid user'
            })
        }
        
        //get user details
        let userObj = utils.getCleanUser(userData)
        return res.json({
                user: userObj, token
            })

    })
})


//port connection response
app.listen(port, () => {
    console.log('Server started on:'+ port )
})


