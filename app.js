const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const funcs = require('./funcs')

const PaymentToken = require('./models/PaymentToken')

const app = express()

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/user', require('./routes/user.routes'))
app.use('/api/pay', require('./routes/pay.routes'))

const PORT = config.get('port') || 8080

async function clearTokens(params) {
    for await (const doc of PaymentToken.find()) {
        if (doc.expiryDate < Date.now()) {
            console.log("Removing", doc._id); // Prints documents one at a time
            doc.remove()
        }
    }
}

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        app.listen(PORT, () => console.log(`Started at ${PORT}`));

        const timer = setInterval(clearTokens, 60000);

    } catch (error) {
        console.log("Server err", error.message);
        process.exit(1);
    }
}

start();
