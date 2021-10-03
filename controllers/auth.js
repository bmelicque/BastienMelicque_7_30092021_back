const db = require('../config/db');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
const zxcvbn = require('zxcvbn');


// On signup, the email is hashed to respect GDPR (no personal data stored on the server)
// The password is encrypted for security reasons
exports.signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        // Checking if the email is valid
        if (!isEmail(email))
            return res.status(400).json({ error: 'Adresse email incorrecte' });

        const hashedEmail = cryptoJS.SHA3(email).toString();

        // Checking email unicity
        const emailSQL = `SELECT * FROM users WHERE users.email = '${hashedEmail}'`;
        const [emailIsUnique] = await (await db).query(emailSQL);
        if (emailIsUnique)
            return res.status(400).json({ error: 'Cet email est déjà utilisée' });

        // Checking username unicity
        const userSQL = `SELECT * FROM users WHERE users.username = '${username}'`;
        const [user] = await (await db).query(userSQL);
        if (user)
            return res.status(400).json({ error: 'Ce pseudo est déjà utilisé' });

        // Checking if the password is strong enough
        const { score } = zxcvbn(password, [username, email]);
        if (score <= 1)
            return res.status(400).json({ error: 'Ce mot de passe est trop faible. Pensez à utiliser des nombres, des caractères spéciaux ou à le rallonger' })

        // Actual post to database
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (username, email, password) VALUES ('${username}', '${hashedEmail}', '${hashedPassword}')`;
        await (await db).query(sql)
        res.status(201).json({ message: 'Utilisateur créé avec succès' })
    } catch (err) {
        res.status(500).json({ err })
    }
}


// Hashes the provided email to see if it exists in the database
// Then compares the provided password with the encrypted one in the database
// On success, provides a secured token to the user
exports.login = async (req, res, next) => {
    try {
        // Checking if email exists in the database
        const hashedEmail = cryptoJS.SHA3(req.body.email).toString();
        const sql = `SELECT * FROM users WHERE users.email = '${hashedEmail}'`;
        const [user] = await (await db).query(sql);
        if (!user)
            return res.status(401).json({ error: 'Utilisateur inexistant' })

        // Checking if the password is valid
        const valid = await bcrypt.compare(req.body.password, user.password)
        if (!valid)
            return res.status(401).json({ error: 'Mot de passe incorrect' })

        // Sending token
        const maxAge = 2 * 86400000; // 2 days
        res.cookie('token', jwt.sign(
            { userId: user.id, role: user.role },
            process.env.TOKEN_PRIVATE_KEY,
            { expiresIn: maxAge }
        ), {
            httpOnly: true,
            maxAge: maxAge
        })
        res.status(200).json({ message: 'Connecté' })
    } catch (err) {
        res.status(500).json({ err });
    }
}

exports.logout = async (req, res) => {
    res.cookie('token', null, { maxAge: 1 });
    res.status(200).json({ message: 'Déconnecté' })
}