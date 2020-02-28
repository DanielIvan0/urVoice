const passport = require('passport')
const User = require('../models/User')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const LocalStrategy = require('passport-local')
const crypto = require('crypto')

// Serialize User
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Deserialize User
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

passport.use(new LocalStrategy(
    async (username, password, done) => {
        console.log('entra a passport-local')
        try{
            console.log('passport -- try')
            const currentUser = await User.findOne({email:username})
            console.log('user found: ' + currentUser)
            if(currentUser){
                // Check password
                console.log('User exixts!')
                const cipher = crypto.createCipher(process.env.CRYPT_ALGORITHM, process.env.CRYPT_KEY)
                let encrypted = cipher.update(password, 'utf8', 'hex')
                encrypted += cipher.final('hex')
                if(currentUser.otp === encrypted){
                    // The passwords are equal
                    console.log('The passwords are equal')
                    await User.findOneAndUpdate({
                        email:currentUser.email
                    }, {
                        otp:0,
                        status:true
                    })
                    console.log('currentUser: ' + currentUser)
                    return done(null, currentUser)
                }else{
                    // The password is wrong
                    console.log('The password is wrong')
                    return done(null, false)
                }
            }else return done(null, false)
        }catch(e){
            console.log(e)
            return done(null, false)
        }
    }
))

// Google Login Strategy
passport.use(new GoogleStrategy(
    {
        callbackURL:'http://localhost:3000/auth/google/redirect',
        clientID:process.env.G_CLIENT_ID,
        clientSecret:process.env.G_CLIENT_SECRET,
        profileFields:['id', 'displayName', 'name', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        const {isAuth} = global
        const currentUser = await User.findOne({
            email:profile._json.email
        })
        console.log(currentUser)
        if(currentUser){
            console.log('It is auth! It is all OK.')
            return done(null, currentUser)
        }else{
            if(isAuth)return done(null, false, {msg:'The user doesn\'t exists.'})
            const newUser = await new User(
                {
                    email:profile._json.email,
                    googleId:profile.id,
                    displayName:profile._json.given_name,
                    thumbnail:profile.photos ? profile.photos[0].value : 'images/profile-picture.jpg',
                    status:true
                }
            ).save()
            return done(null, newUser)
        }
    }
))

module.exports = passport