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


            if (message == '' && type == 21) {
                return res.status(400).json({ errors: [{ msg: 'Неверно заполнено поле', param: 'message', }], errcod: 'valid-err' })
            }

            if (amount < 1)
                return res.status(400).json({ errors: [{ msg: 'Сумма должна быть положительным числом', param: 'amount' }], errcod: 'valid-err' })

            if (sender == target)
                return res.status(400).json({ message: 'Вы не можете платить себе', errors: [{ msg: 'Вы не можете платить себе', param: 'target' }], errcod: 'valid-err' })

            //check sender
            const senderUser = await User.findOne({ userid: sender })

            if (!senderUser) {
                return res.status(400).json({ errors: [{ msg: 'Отправитель не существует', param: 'sender' }], errcod: 'valid-err' })
            }

            //check target
            const targetUser = await User.findOne({ userid: target })

            if (!targetUser) {
                return res.status(400).json({ errors: [{ msg: 'Получатель не существует', param: 'target' }], errcod: 'valid-err' })
            }

            //check token
            const decoded = jwt.verify(
                token,
                config.get('jwtSecret'),
            );

            if (!decoded)
                return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })

            //switch type
            if (type == 1) {
                if (senderUser.userid.length < 8 || targetUser.userid.length < 8)
                    return res.status(400).json({ message: 'Проверка завершилась с ошибками', errors: [{ msg: 'Неверно заполнено поле', param: 'target' }], errcod: 'valid-err' })

                //check if service user
                if (targetUser.accesslevel == -1)
                    return res.status(400).json(
                        {
                            message: 'Вы не можете переводить сервисному пользователю',
                            errors: [
                                {
                                    msg: 'Вы не можете переводить сервисному пользователю',
                                    param: 'target'
                                }
                            ],
                            errcod: 'valid-err'
                        })

                //money actions
                if (senderUser.userid == decoded.userid) {

                    if (senderUser.balance >= amount) {
                        senderUser.balance -= amount
                        targetUser.balance += amount

                        await senderUser.save()
                        await targetUser.save()
                    }
                    else
                        return res.status(400).json({ message: 'Недостаточно средств', errcod: 'no-money' })
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
                                return res.status(400).json({ errors: [{ msg: 'Неверно заполнено поле', param: 'paymentToken' }], errcod: 'valid-err' })
                        }
                        else
                            return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })
                        break
                }
            }

            transactionParams = { sender, target, amount, type, message, state: 1 };
            const transaction = new Transaction(transactionParams);
            await transaction.save()
            res.status(201).json({ message: 'Успешная транзакция', transaction });

        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else {
                res.status(500).json({ message: 'Какая-то ошибка. Попробуйте еще раз.', errcod: 'some-err' })
            }
        }

    }
)

// /api/pay/listtransact
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

            if (!decoded)
                return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })

            const requestingUser = await User.findOne({ userid: decoded.userid })
            if (!requestingUser) {
                return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })
            }

            let searchParams = [{ sender: decoded.userid }, { target: decoded.userid }]


            if (requestingUser.accesslevel >= 4) {
                if (typeof req.body.showAll === 'boolean' && req.body.showAll === true) {
                    searchParams = [{}]
                }
                else
                    if (req.body.userid && typeof req.body.userid === 'string') {
                        searchParams = [{ sender: req.body.userid }, { target: req.body.userid }]
                    }
            }
            else {
                if (requestingUser.accesslevel === 2) {
                    if (typeof req.body.showAll === 'boolean' && req.body.showAll === true) {
                        searchParams = [{ sender: decoded.userid }, { target: decoded.userid }, { type: 3 }, { type: 31 }]
                    }
                    else
                        if (req.body.userid && typeof req.body.userid === 'string') {
                            searchParams = [{ sender: req.body.userid, target: "shop" }, { target: req.body.userid, sender: "shop" }]
                        }
                }
                if (requestingUser.accesslevel === 3) {
                    if (typeof req.body.showAll === 'boolean' && req.body.showAll === true) {
                        searchParams = [{ sender: decoded.userid }, { target: decoded.userid }, { type: 2 }, { type: 21 }]
                    }
                    else
                        if (req.body.userid && typeof req.body.userid === 'string') {
                            searchParams = [{ sender: req.body.userid, target: "bank" }, { target: req.body.userid, sender: "bank" }]
                        }
                }
            }
            const finded = await Transaction.find().or(searchParams).select('amount _id type state sender target date')
            res.status(200).json({ transactions: finded })
        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else
                res.status(500).json({ message: 'Какая-то ошибка. Попробуйте еще раз.', errcod: 'some-err' })
        }
    }
)

// /api/pay/undotransact
router.post(
    '/undotransact',
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

            if (!decoded)
                return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })

            const requestingUser = await User.findOne({ userid: decoded.userid })
            if (!requestingUser)
                return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })

            const transaction = await Transaction.findOne({ _id: id })
            if (!transaction)
                return res.status(400).json({ errors: [{ msg: 'Транзакция не существует', param: 'transaction' }], errcod: 'valid-err' })

            //check if already canceled
            if (transaction.state == -1)
                return res.status(400).json({ errors: [{ msg: 'Транзакция уже отменена', param: 'transaction' }], errcod: 'valid-err' })

            //check rights
            const canModifyCashier = ((transaction.type == 3 || transaction.type == 31) && requestingUser.accesslevel === 2) && (config.get("rights.2.modifyTransactions") || false)
            const canModifyModerator = ((transaction.type == 2 || transaction.type == 21) && requestingUser.accesslevel === 3) && (config.get("rights.3.modifyTransactions") || false)

            if (!canModifyCashier &&
                !canModifyModerator &&
                requestingUser.accesslevel < 4)
                return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })

            //check sender
            const senderUser = await User.findOne({ userid: transaction.sender })

            if (!senderUser) {
                return res.status(400).json({ message: 'Отправитель не существует', errcod: 'user-not-exist' })
            }

            //check target
            const targetUser = await User.findOne({ userid: transaction.target })

            if (!targetUser) {
                return res.status(400).json({ message: 'Получатель не существует', errcod: 'user-not-exist' })
            }

            if (transaction.state != 0)
                switch (transaction.type) {
                    case 1:
                        //money actions
                        senderUser.balance += transaction.amount
                        targetUser.balance -= transaction.amount

                        await senderUser.save()
                        await targetUser.save()
                        break;

                    case 21:
                        senderUser.balance += transaction.amount;
                        await senderUser.save();
                        break;

                    case 2:
                        targetUser.balance -= transaction.amount;
                        await targetUser.save();
                        break;

                    default:
                        return res.status(400).json({ message: 'Невозможно отменить транзакцию', errcod: 'user-not-exist' })
                        break;
                }

            transaction.state = -1;
            await transaction.save()

            res.status(200).json({ message: 'Транзакция успешно отменена', errcod: 'success' })
        }
        catch (e) {
            console.log(e)
            res.status(500).json({ message: 'Какая-то ошибка. Попробуйте еще раз.', errcod: 'some-err' })
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

            if (!decoded)
                return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })

            const requestingUser = await User.findOne({ userid: decoded.userid })
            if (!requestingUser)
                return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })

            const transaction = await Transaction.findOne({ _id: id })
            if (!transaction)
                return res.status(400).json({ errors: [{ msg: 'Транзакция не существует', param: 'transaction' }], errcod: 'valid-err' })

            //check rights
            const canGetCashier = ((transaction.type == 3 || transaction.type == 31) && requestingUser.accesslevel === 2)
            const canGetModerator = ((transaction.type == 2 || transaction.type == 21) && requestingUser.accesslevel === 3)

            if (!canGetCashier &&
                !canGetModerator &&
                requestingUser.accesslevel < 4)
                return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })

            res.status(200).json({ transaction })
        }
        catch (e) {
            if (e.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else {
                res.status(500).json({ message: 'Какая-то ошибка. Попробуйте еще раз.', errcod: 'some-err' })
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
                res.status(500).json({ message: 'Какая-то ошибка. Попробуйте еще раз.', errcod: 'some-err' })
        }
    }
)

module.exports = router