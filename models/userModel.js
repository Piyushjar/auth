const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
 
//schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email address required']
    },
    password: {
        type: String,
        minLength: 5,
        required: [true, 'Password must be at least 5 characters'],
        select: false,
    },
    passwordChangedAt : Date,
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
});

userSchema.methods.validPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTtimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime()/1000,10
        );
        return JWTtimestamp < changedTimestamp;
    }
    return false;
}

const User = mongoose.model('User',userSchema);
 
module.exports = User;