/**
 * @fileoverview Diese Datei enthält die Route zur Benutzerregistrierung.
 * Sie ermöglicht die Erstellung neuer Benutzer, das Senden von Bestätigungs-E-Mails
 * und die Überprüfung der Passwortstärke.
 * 
 * @module userRegister
 * @author Ayoub
 * Die Funktionen wurden mit Unterstützung von KI-Tools angepasst und optimiert.
 */

const express = require('express');
const router = express.Router();
const User = require('./models/modelUser.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerificationEmail } = require('./models/modelMailer');

/**
 * Überprüft, ob ein Passwort den Sicherheitsanforderungen entspricht.
 * 
 * Anforderungen:
 * - Mindestens 6 Zeichen lang
 * - Enthält mindestens einen Buchstaben und eine Zahl
 * 
 * @function isPasswordValid
 * @param {string} password - Das zu überprüfende Passwort.
 * @returns {boolean} `true`, wenn das Passwort gültig ist, sonst `false`.
 * @example
 * console.log(isPasswordValid("Test123")); // true
 * console.log(isPasswordValid("abc")); // false
 */
function isPasswordValid(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

/**
 * Registriert einen neuen Benutzer, speichert ihn in der Datenbank und sendet eine Bestätigungs-E-Mail.
 * 
 * @async
 * @function
 * @route POST /
 * @param {Object} req - Das Request-Objekt mit den Registrierungsdaten.
 * @param {string} req.body.user_name - Der Benutzername des neuen Nutzers.
 * @param {string} req.body.email - Die E-Mail-Adresse des neuen Nutzers.
 * @param {string} req.body.password - Das Passwort des neuen Nutzers.
 * @param {Object} res - Das Response-Objekt.
 * @returns {Promise<void>} Eine Bestätigung über die erfolgreiche Registrierung.
 * @throws {Error} Falls die Registrierung oder das Versenden der Bestätigungs-E-Mail fehlschlägt.
 * @example
 * fetch("/register", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({
 *     user_name: "MaxMustermann",
 *     email: "max@example.com",
 *     password: "Passwort123"
 *   })
 * }).then(response => response.json()).then(data => console.log(data));
 */
router.post('/', async (req, res) => {
    const { user_name, email, password } = req.body;

    if (!user_name || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required.' });
    }

    if (!isPasswordValid(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and include at least one uppercase letter and one number.' });
    }

    try {
        const verificationKey = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            user_name,
            email,
            password_hash: hashedPassword,
            verification_key: verificationKey,
            is_verified: false,
            registered_at: new Date()
        });

        await sendVerificationEmail(email, verificationKey);

        res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    } catch (error) {
        console.error('Error registering user:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        if (error.message === 'Failed to send verification email') {
            return res.status(500).json({ error: 'User registered but failed to send verification email. Please contact support.' });
        }

        res.status(500).json({ error: 'Error registering user. Please try again.' });
    }
});

module.exports = router;