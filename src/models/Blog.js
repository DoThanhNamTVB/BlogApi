const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const BlogSchema = new Schema(
    {
        userId: {
            type: ObjectId,
            require: true,
            ref: "User",
        },
        private: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            require: true,
        },
        image: [
            {
                path: String,
                fileName: String,
            },
        ],
        comment: [
            {
                userId: { type: ObjectId, ref: "User" },
                createdAt: { type: Date, default: Date.now() },
                comment: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Blog", BlogSchema);
