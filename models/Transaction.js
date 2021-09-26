const { Schema, model } = require('mongoose')

// type
//1: "Перевод",
//2: "Зачисление зарплаты",
//21: "Штраф",
//3: "Покупка",
//31: "Возврат"

// state
//
//'-1': "Отменен"
//0: "Обработка"
//1: "Успешно"

const schema = new Schema({
    date: { type: Date, default: Date.now },
    sender: { type: String },
    target: { type: String },
    amount: { type: Number, default: 0 },
    type: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
    message: { type: String }

}, { collection: 'banking' })

module.exports = model('Transaction', schema);