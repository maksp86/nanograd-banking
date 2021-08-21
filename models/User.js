const { Schema, model } = require('mongoose')

const schema = new Schema({
    userid: { type: String, unique: true },
    name: { type: String },
    surname: { type: String },
    patronymic: { type: String },

    //hashed
    password: { type: String },
    balance: { type: Number, default: 0 },
    /*
    0 - usual user
    2 - cashier
    3 - moderator
    4 - admin
    10 - superuser
    */
    accesslevel: { type: Number }
}, { collection: 'users' })

module.exports = model('User', schema);