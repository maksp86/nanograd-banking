const { Route, Router } = require('express')
const { check, validationResult, body } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const funcs = require('../funcs')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const PaymentToken = require('../models/PaymentToken')
const router = Router()


// /api/pay/send
router.post(
    '/send',
    [
        check('sender', 'Неверно заполнено поле').isString().isLength({ min: 4, max: 8 }),
        check('target', 'Неверно заполнено поле').isString().isLength({ min: 4, max: 8 }),
        check('amount', 'Неверно заполнено поле').isNumeric({ no_symbols: true }).isInt({ allow_leading_zeroes: false }).not().isString(),
        check('type', 'Неверно заполнено поле').isInt(),
        check('token', 'Неверно заполнено поле').isString().isLength({ min: 1 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const message = (req.body.message && typeof req.body.message === 'string') ? req.body.message.substr(0, 200) : '';

            const { sender, target, amount, type, token } = req.body

            console.log("req.body", req.body)

            if (message == '' && type == 21) {
                return res.status(400).json({ errors: [{ msg: 'Неверно заполнено поле', param: 'message', }] })
            }

            if (amount < 1)
                return res.status(400).json({ errors: [{ msg: 'Сумма должна быть положительным числом', param: 'amount', }] })

            if (sender == target)
                return res.status(400).json({ message: 'Вы не можете платить себе', errors: [{ msg: 'Вы не можете платить себе', param: 'target', }] })

            const senderUser = await User.findOne({ userid: sender })

            if (!senderUser && (type == 1 || type == 21 || type == 3)) {
                return res.status(400).json({ errors: [{ msg: 'Отправитель не существует', param: 'sender' }] })
            }

            const targetUser = await User.findOne({ userid: target })

            if (!targetUser && (type == 1 || type == 2 || type == 31)) {
                return res.status(400).json({ errors: [{ msg: 'Получатель не существует', param: 'target' }] })
            }

            const decoded = jwt.verify(
                token,
                config.get('jwtSecret'),
            );

            if (!decoded)
                return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })

            if (type == 1) {
                if (senderUser.userid == decoded.userid) {

                    if (senderUser.balance >= amount) {
                        senderUser.balance -= amount
                        targetUser.balance += amount

                        await senderUser.save()
                        await targetUser.save()
                    }
                    else
                        return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-money' })
                }
                else
                    return res.status(400).json({ message: 'Невозможно списать деньги с чужого счёта' })
            }
            else {
                const requestingUser = await User.findOne({ userid: decoded.userid })
                if (!requestingUser) {
                    return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })
                }

                switch (type) {

                    case 2:
                    case 21:
                        if (requestingUser.accesslevel == 3 || requestingUser.accesslevel == 10) {
                            if (type == 2) {
                                targetUser.balance += amount;
                                await targetUser.save();
                            }
                            else {
                                senderUser.balance -= amount;
                                await senderUser.save();
                            }
                        }
                        else
                            return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })
                        break

                    case 3:
                    case 31:
                        if (requestingUser.accesslevel == 2 || requestingUser.accesslevel == 10) {
                            if (req.body.paymentToken) {
                                const findedToken = await PaymentToken.findOne({ _id: req.body.paymentToken })

                                if (findedToken && findedToken.expiryDate > new Date()) {
                                    await findedToken.remove();
                                    console.log("findedToken.userid", findedToken.userid)
                                    if (findedToken.userid != (type === 31 ? targetUser : senderUser).userid)
                                        return res.status(400).json({ message: 'Чужой платежный токен', errcod: 'stolen-paytoken' })

                                    if (type == 31) {
                                        targetUser.balance += amount;
                                        await targetUser.save();
                                    }
                                    else {
                                        if (senderUser.balance >= amount) {
                                            senderUser.balance -= amount;
                                            await senderUser.save();
                                        }
                                        else
                                            return res.status(400).json({ message: 'Недостаточно средств', errcod: 'no-money' })
                                    }
                                }
                                else
                                    return res.status(400).json({ message: 'Срок действия платежного токена истек', errcod: 'pay-token-expired' })
                            }
                            else
                                return res.status(400).json({ errors: [{ msg: 'Неверно заполнено поле', param: 'paymentToken' }] })
                        }
                        else
                            return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })
                        break
                }
            }

            transactionParams = { sender, target, amount, type, message };
            const transaction = new Transaction(transactionParams);
            await transaction.save()
            res.status(201).json({ message: 'Успешная транзакция', transaction });

        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else {
                console.log("err", e);
                res.status(500).json({ message: 'Какая-то ошибка. Попробуй еще раз.', errcod: 'some-err' })
            }
        }

    }
)

router.post(
    '/listtransact',
    [
        check('token', 'Неверно заполнено поле').isString().isLength({ min: 1 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const { token } = req.body

            const decoded = jwt.verify(
                token,
                config.get('jwtSecret'),
            );

            const requestingUser = await User.findOne({ userid: decoded.userid })
            if (!requestingUser) {
                return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })
            }

            let searchParams = [{ sender: decoded.userid }, { target: decoded.userid }]

            if (requestingUser.accesslevel > 4) {
                if (typeof req.body.showAll === 'boolean' && req.body.showAll === true) {
                    searchParams = [{}]
                }
                else
                    if (req.body.userid && typeof req.body.userid === 'string') {
                        searchParams = [{ sender: req.body.userid }, { target: req.body.userid }]
                    }
            }
            console.log(searchParams)
            const finded = await Transaction.find().or(searchParams)
            res.status(200).json({ transactions: finded })
        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else
                res.status(500).json({ message: 'Какая-то ошибка. Попробуй еще раз.', errcod: 'some-err' })
        }
    }
)

router.post(
    '/gettransact',
    [
        check('token', 'Неверно заполнено поле').isString().isLength({ min: 1 }),
        check('id', 'Неверно заполнено поле').isString().isLength({ min: 24, max: 24 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const { token, id } = req.body

            const decoded = jwt.verify(
                token,
                config.get('jwtSecret'),
            );

            const requestingUser = await User.findOne({ userid: decoded.userid })
            if (!requestingUser)
                return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })

            const transaction = await Transaction.findOne({ _id: id })
            if (!transaction)
                return res.status(400).json({ errors: [{ msg: 'Транзакция не существует', param: 'transaction' }] })

            if (transaction.sender != requestingUser.userid && requestingUser.accesslevel < 4)
                return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })

            res.status(200).json({ transaction })
        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else {
                console.log("err", e);
                res.status(500).json({ message: 'Какая-то ошибка. Попробуй еще раз.', errcod: 'some-err' })
            }
        }
    }
)

router.post(
    '/gentoken',
    [
        check('token', 'Неверно заполнено поле').isString().isLength({ min: 1 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const { token } = req.body

            const decoded = jwt.verify(
                token,
                config.get('jwtSecret'),
            );

            if (!decoded)
                return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })

            paymentTokenParams = { userid: decoded.userid }
            const paymentToken = new PaymentToken(paymentTokenParams)
            await paymentToken.save()

            res.status(201).json({ message: 'Платежный токен создан успешно', paymentToken: paymentToken });
        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else
                res.status(500).json({ message: 'Какая-то ошибка. Попробуй еще раз.', errcod: 'some-err' })
            //console.log('ERR', e);
        }
    }
)

module.exports = router