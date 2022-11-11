const mongoose = require('mongoose');
const {Schema}= mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    nombre: {
        type:String,
        require:true
    },
    email: {
        type:String,
        require: true,
        unique: true
    },
    password: {
        type:String,
        require: true
    },
    date: {
        type: Date,
        default:Date.now
    }
});

UserSchema.method({
    async encryptPassword (password){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);
        return hash;
    },
    async matchPassword (password){
        return await bcrypt.compare(password, this.password);
    }
})

module.exports = mongoose.model('User',UserSchema);