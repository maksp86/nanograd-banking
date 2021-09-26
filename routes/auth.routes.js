const { Route, Router } = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const funcs = require('../funcs')
const User = require('../models/User')
const router = Router()

// /api/auth/login
router.post(
    '/login',
    [
        check('userid', 'Неверно заполнено поле').isString().isLength({ min: 8, max: 8 }),
        check('password', 'Неверно заполнено поле').isString().isLength({ min: 1 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(300).json({ message: 'Проверка завершилась с ошибками', errcod: 'valid-err', errors: errors.array() })
            }

            const { userid, password } = req.body

            const findedUser = await User.findOne({ userid: userid })

            if (!findedUser) {
                return res.status(400).json({ errors: [{ msg: 'Пользователь не существует', param: 'userid' }], errcod: 'user-not-exist' })
            }

            const isMatch = await bcrypt.compare(password, findedUser.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Неверный пароль', param: 'password' }] });
            }

            const token = jwt.sign(
                { userid: findedUser.userid },
                config.get('jwtSecret'),
                { expiresIn: '4h' });

            res.status(200).json({ token, userid: findedUser.userid });

        } catch (error) {
            res.status(500).json({ message: 'Какая-то ошибка. Попробуйте еще раз.', errcod: 'some-err' })
        }
    });

module.exports = router

