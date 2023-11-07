const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
    {
        userName: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        dateOfBirth: {
            type: String,
        },
        image: {
            path: String,
            fileName: String,
        },
        password: { type: String, required: true },
        verify: { type: String },
    },
    {
        timestamps: true,
    }
);

// encryting password before saving data

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//check password

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
