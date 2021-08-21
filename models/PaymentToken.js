const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')
const moment = require('moment');

const User = require('../models/User')

const schema = new Schema({
    _id: {
        type: String,
        default: () => nanoid(10)
    },
    userid: { type: String },
    expiryDate: { type: Date, default: function () { return moment().add(1, 'minutes'); } }


}, { collection: 'paymenttokens' })

module.exports = model('PaymentToken', schema);