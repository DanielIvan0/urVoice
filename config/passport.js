const passport = require('passport')
const User = require('../models/User')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

// Serialize User
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Deserialize User
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

// Google Login Strategy
passport.use(new GoogleStrategy(
    {
        callbackURL:'http://localhost:3000/auth/google/redirect',
        clientID:process.env.G_CLIENT_ID,
        clientSecret:process.env.G_CLIENT_SECRET,
        profileFields:['id', 'displayName', 'name', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        const currentUser = await User.findOne({googleId:profile.id})
        if(currentUser){
            done(null, currentUser)
        }else{
            const newUser = await new User(
                {
                    email:profile._json.email,
                    googleId:profile.id,
                    displayName:profile._json.given_name,
                    thumbnail:profile.photos ? profile.photos[0].value : 'images/profile-picture.jpg'
                }
            ).save()
            done(null, newUser)
        }
    }
))

module.exports = passport