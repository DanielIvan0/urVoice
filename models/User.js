const {Schema, model} = require('mongoose')
const userSchema = new Schema(
    {
        email:{
            type:String,
            unique:true,
            required:true
        },
        otp:String,
        googleId:{
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
        },
        status:{
            type:Boolean,
            default:false
        },
        college:{
            type:String,
            default:'-'
        },
        occupation:[
            {
                student:Boolean,
                teacher:Boolean,
                admin:Boolean
            }
        ],
        degree:{
            type:String,
            default:'-'
        }
    }
)

module.exports = model('User', userSchema)