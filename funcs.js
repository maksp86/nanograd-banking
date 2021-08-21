const config = require('config')

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

function passwordGen() {
    var words = config.get('passwordWords');
    var word = words[Math.floor(Math.random() * words.length)];

    return word + getRandomIntInclusive(1000, 9999);
}

module.exports = {
    getRandomInt: getRandomIntInclusive,
    makePassword: passwordGen
}