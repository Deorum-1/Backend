import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { Buffer } from "node:buffer";
import { BCRYPT_PASSWORD_MAX_BYTES } from "../config/constants.js";



const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minLength: 1,
            maxLength: 30
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
            maxLength: BCRYPT_PASSWORD_MAX_BYTES,
            validate: {
                validator: (password) =>
                    Buffer.byteLength(password, "utf8") <= BCRYPT_PASSWORD_MAX_BYTES,
                message: `Password must not exceed ${BCRYPT_PASSWORD_MAX_BYTES} UTF-8 bytes`,
            },
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
    },
    {
        timestamps: true,
    }
)
// before saving any password, you must hash it
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// compare passwords
userSchema.methods.comparepassword = async function (password) {
    if (
        typeof password !== "string" ||
        Buffer.byteLength(password, "utf8") > BCRYPT_PASSWORD_MAX_BYTES
    ) {
        return false;
    }

    return await bcrypt.compare(password, this.password);
}


export const User = mongoose.model("User", userSchema);    