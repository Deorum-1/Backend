import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;


        // basic validation
        if (!username || !password || !email) {
            return res.status(400).json({ message: "All felds are important!" })
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
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        // checking if the user already exists
        const { email, password } = req.body;

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