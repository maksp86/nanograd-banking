const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const funcs = require('./funcs')
const rateLimit = require("express-rate-limit");

const PaymentToken = require('./models/PaymentToken')

const app = express()

app.set('trust proxy', 1)
app.use(express.json({ extended: true }))

const limiter = rateLimit({
    windowMs: 2000, // 1 sec
    max: 10, // limit each IP to 100 requests per windowMs
    message:
        "Too many requests from your ip"
});

app.use(limiter);

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/user', require('./routes/user.routes'))
app.use('/api/pay', require('./routes/pay.routes'))

const PORT = config.get('port') || 8080

async function clearTokens(params) {
    for await (const doc of PaymentToken.find()) {
        if (doc.expiryDate < Date.now()) {
            //console.log("Removing", doc._id);
            doc.remove()
        }
    }
}

async function start() {
    try {
        console.log(`Mongodb connecting...`)
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        console.info(`Mongodb connected`)

        app.listen(PORT, () => console.info(`Started at ${PORT}`));

        const timer = setInterval(clearTokens, 60000);

    } catch (error) {
        console.log("Server err", error.message);
        process.exit(1);
    }
}

start();
