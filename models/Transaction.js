const { Schema, model } = require('mongoose')

const schema = new Schema({
    date: { type: Date, default: Date.now },
    sender: { type: String },
    target: { type: String },
    amount: { type: Number, default: 0 },
    type: { type: Number, default: 0 },
    message: { type: String }

}, { collection: 'banking' })

module.exports = model('Transaction', schema);