import { User } from "../models/user.model.js";
import { Buffer } from "node:buffer";
import { BCRYPT_PASSWORD_MAX_BYTES } from "../config/constants.js";

const hasRequiredStringFields = (body, fields) =>
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    fields.every((field) => typeof body[field] === "string" && body[field].length > 0);

const passwordWithinBcryptLimit = (password) =>
    Buffer.byteLength(password, "utf8") <= BCRYPT_PASSWORD_MAX_BYTES;

const registerUser = async (req, res) => {
    try {
        if (!hasRequiredStringFields(req.body, ["username", "password", "email"])) {
            return res.status(400).json({
                message: "Username, password, and email must be non-empty strings",
            });
        }

        const { username, password, email } = req.body;

        if (!passwordWithinBcryptLimit(password)) {
            return res.status(400).json({
                message: `Password must not exceed ${BCRYPT_PASSWORD_MAX_BYTES} UTF-8 bytes`,
            });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // create new user
        const user = await User.create({
            username,
            password,
            email: email.toLowerCase(),
            logedIn: false,
        });

        res.status(201).json({ message: "User registered successfully", user: { id: user._id, email: user.email, username: user.username } });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
}

const loginUser = async (req, res) => {
    try {
        // checking if the user already exists
        if (!hasRequiredStringFields(req.body, ["email", "password"])) {
            return res.status(400).json({
                message: "Email and password must be non-empty strings",
            });
        }

        const { email, password } = req.body;

        if (!passwordWithinBcryptLimit(password)) {
            return res.status(400).json({
                message: `Password must not exceed ${BCRYPT_PASSWORD_MAX_BYTES} UTF-8 bytes`,
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) return res.status(400).json({ message: "User not found" });

        // compare the password
        const isMatch = await user.comparepassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({ message: "User logged in successfully", user: { id: user._id, email: user.email, username: user.username } });
    } catch {
        res.status(500).json({
            messag: "Internal server Error"
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({
            email: email
        });

        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User logged out successfully" });
    } catch {
        res.status(500).json({
            message: "Internal server Error"
        })
    }
}

export {
    registerUser,
    loginUser,
    logoutUser
}