import mongoose from 'mongoose';
// const connectToMongoDB = require('../../middleware/database'); not working when using require. why?
import connectToMongoDB from "../../middleware/database";
import User from '../../models/User';
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
import { serialize } from 'cookie';

const handler = async (req, res) => {
    try {
        const { accountAddress, password } = req.body;
        let user = await User.findOne({ accountAddress });
        if (!user) {
            return res.status(400).json({ success: false, error: "Account doesn't exists. Please try to Sign Up!" });
        }

        const bytes = CryptoJS.AES.decrypt(user.password, process.env.AES_SECRET);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

        if (password != decryptedPassword) {
            return res.status(400).json({ success: false, error: "Invalid Credentials" });
        }

        const token = jwt.sign({ accountAddress }, process.env.JWT_SECRET);

        res.setHeader('Set-Cookie', serialize('token', token, { path: '/' }));
        res.json({ success: true, token });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error." });
    }
}

export default connectToMongoDB(handler);