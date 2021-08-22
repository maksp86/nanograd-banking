const { Route, Router } = require('express')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const router = Router()

const User = require('../models/User')
const funcs = require('../funcs')

// /api/user/register
router.post(
    '/register',
    [
        check('name', 'Неверно заполнено поле').isString().isLength({ min: 2 }),
        check('surname', 'Неверно заполнено поле').isString().isLength({ min: 2 }),
        check('patronymic', 'Неверно заполнено поле').isString().isLength({ min: 2 }),
    ],
    async (req, res) => {
        try {

            console.log('req', req.body)

            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const { name, surname, patronymic } = req.body

            const pass = funcs.makePassword();
            const userid = funcs.getRandomInt(10000000, 99999999)

            const hashedPass = await bcrypt.hash(pass, config.get('hashSalt'))

            const userParams = { name: name, surname: surname, patronymic: patronymic, password: hashedPass, userid: userid, accesslevel: 0 }

            if (!await User.findOne()) {
                userParams.accesslevel = 10;
                console.log("no users")
            }
            else {
                if (req.body.token && req.body.token.length > 0) {
                    const token = req.body.token;

                    const decoded = jwt.verify(
                        token,
                        config.get('jwtSecret'),
                    );

                    if (decoded) {
                        const requestingUser = await User.findOne({ userid: decoded.userid })

                        if (!requestingUser) {
                            //WTF
                            return res.status(400).json({ message: 'Запрашивающий пользователь не существует', errcod: 'req-sender-user-not-exist' })
                        }

                        if (requestingUser.accesslevel < 4)
                            return res.status(400).json({ message: 'Не хватает прав доступа', errcod: 'no-permission' })

                        const userExists = await User.findOne({ name: name, surname: surname, patronymic: patronymic })
                        if (userExists) {
                            return res.status(400).json({ message: 'Пользователь существует' })
                        }

                    }
                    else {
                        return res.status(400).json({ message: 'Неверный токен', errcod: 'inv-token' })
                    }
                }
                else
                    return res.status(400).json({ errors: [{ msg: 'Неверно заполнено поле', param: 'token' }] })
            }

            const user = new User(userParams)

            await user.save()

            userParams.password = pass

            res.status(201).json({ message: 'Пользователь добавлен', user: userParams });

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.status(400).json({ message: 'Срок действия токена истек', errcod: 'token-expired' })
            }
            else
                res.status(500).json({ message: 'Какая-то ошибка. Попробуй еще раз.', errcod: 'some-err' })
            console.log('ERR', error);
        }
    });

// /api/user/get
router.post(
    '/get',
    [
        check('userid', 'Неверно заполнено поле').isString().isLength({ min: 4, max: 8 }),
    ],
    async (req, res) => {
        try {
            console.log(req.body)

            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const { userid } = req.body

            const requestedUser = await User.findOne({ userid: userid })

            if (!requestedUser) {
                return res.status(400).json({ message: 'Запрашиваемый пользователь не существует', errcod: 'req-user-not-exist' })
            }

            const user =
            {
                userid: requestedUser.userid,
                name: requestedUser.name,
                surname: requestedUser.surname.slice(0, 1),
                accesslevel: requestedUser.accesslevel
            }

            if (req.body.token && req.body.token.length > 0) {
                const token = req.body.token;

                const decoded = jwt.verify(
                    token,
                    config.get('jwtSecret'),
                );

                if (decoded) {
                    let requestingUser = null;

                    if (!(requestedUser.userid === decoded.userid)) {
                        console.log('search', decoded.userid)
                        requestingUser = await User.findOne({ userid: decoded.userid })

                        if (!requestingUser) {
                            //WTF
                            return res.status(400).json({ message: 'Запрашиваемый пользователь не существует', errcod: 'req-user-not-exist' })
                        }
                    }

                    if (requestedUser.userid === decoded.userid || (requestingUser && requestingUser.accesslevel >= 3)) {
                        user.surname = requestedUser.surname;
                        user.patronymic = requestedUser.patronymic;
                    }

                    if (requestedUser.userid === decoded.userid || (requestingUser && requestingUser.accesslevel > 3)) {
                        user.balance = requestedUser.balance
                    }

                }
            }
            console.log('returned', user)
            return res.status(200).json({ user });

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

module.exports = router