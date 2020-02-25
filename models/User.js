const {Schema, model} = require('mongoose')
const userSchema = new Schema(
    {
        email:{
            type:String,
            unique:true,
            required:true
        },
        password:String,
        googleId:{
            type:String,
            unique:true,
            sparse:true
        },
        facebookId:{
            type:String,
            unique:true,
            sparse:true
        },
        displayName:{
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            default:'images/profile-picture.jpg'
        }
    }
)

module.exports = model('User', userSchema)