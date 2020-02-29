const {Schema, model} = require('mongoose')
const userSchema = new Schema(
    {
        email:{
            type:String,
            unique:true,
            required:true
        },
        email2:{
            type:String,
            default:""
        },
        otp:String,
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
        occupation:{
            student:Boolean,
            teacher:Boolean,
            admin:Boolean
        },
        degree:{
            type:String,
            default:'-'
        }
    }
)

module.exports = model('User', userSchema)