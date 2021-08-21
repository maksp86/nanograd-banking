const { Schema, model } = require('mongoose')

//{ date: new Date(), number: 93023, amount: 100, sender: "98661308", target: currUser.userid, type: 1 }
const schema = new Schema({
    date: { type: Date, default: Date.now },
    sender: { type: String },
    target: { type: String },
    amount: { type: Number, default: 0 },
    type: { type: Number, default: 0 },
    message: { type: String }

}, { collection: 'banking' })

module.exports = model('Transaction', schema);