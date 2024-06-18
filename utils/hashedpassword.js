const bcrypt = require('bcrypt');

const password = 'password123';
async function generateHash(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    return hashedPassword;
}
generateHash(password)
