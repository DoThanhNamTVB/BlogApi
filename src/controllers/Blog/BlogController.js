const Blog = require("../../models/Blog");
const Users = require("../../models/User");
const cloudinary = require("cloudinary").v2;

const addBlog = async (req, res, next) => {
    try {
        const { private, title, content } = req.body;
        const userId = req.user._id;
        const files = req.files;

        const findTitleUnique = await Blog.findOne({
            userId: userId,
            title: title,
        });
        if (findTitleUnique) {
            files?.forEach(async (item) => {
                await cloudinary.uploader.destroy(item?.filename);
            });
            res.status(404).json("Title have existed");
        } else {
            const images = [];
            if (files?.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    images.push({
                        path: files[i].path,
                        fileName: files[i].filename,
                    });
                }
            }

            req.body["image"] = images;

            const newBlog = await Blog.create({
                userId: userId,
                private: private || true,
                title: title,
                content: content,
                image: req.body.image,
            });

            res.status(201).json({
                _id: newBlog._id,
                userId: newBlog.userId,
                private: newBlog.private,
                title: newBlog.title,
                content: newBlog.content,
                image: newBlog.image,
            });
        }
    } catch (error) {
        res.status(401);
        throw new Error("Fail at create BlogController" + error);
    }
};

const putBlog = async (req, res, next) => {
    try {
        const { newId } = req.params;
        const userId = req.user._id;
        const { private, title, content } = req.body;
        const files = req.files;
        const findBlog = await Blog.findById({ _id: newId });

        const findTitleUnique = await Blog.findOne({
            userId: userId,
            title: title,
        });
        if (findTitleUnique && title !== findBlog.title) {
            files?.forEach(async (item) => {
                await cloudinary.uploader.destroy(item?.filename);
            });
            res.status(404).json("title have existed");
        } else if (findBlog) {
            const images = [];
            if (files?.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    images.push({
                        path: files[i].path,
                        fileName: files[i].filename,
                    });
                }
            }

            if (title && content && images) {
                findBlog?.image.forEach(async (item) => {
                    await cloudinary.uploader.destroy(item?.fileName);
                });

                findBlog.private = private || findBlog.private;
                findBlog.title = title || findBlog.title;
                findBlog.content = content || findBlog.content;
                findBlog.image = images || findBlog.image;

                const updateBlog = await findBlog.save();
                io.emit("put-new", updateBlog);
                res.status(200).json(updateBlog);
            } else {
                res.status(400).json({
                    msg: `Invalid data of ${
                        !title ? " title" : !content ? " content" : ""
                    }`,
                });
            }
        } else {
            files?.forEach(async (item) => {
                await cloudinary.uploader.destroy(item?.filename);
            });
            res.status(404).json("Not found blog");
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const getNew = async (req, res, next) => {
    try {
        const newId = req.params.newId;
        const getNew = await Blog.findById(newId)
            .populate({
                path: "comment.userId",
                select: "_id image userName email ",
            })
            .populate({
                path: "userId",
                select: "_id image userName email ",
            });
        if (getNew) {
            res.status(200).json(getNew);
        } else {
            res.status(501).json("Not found new");
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const getAllBlog = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const getBlog = await Blog.find({ userId: userId });
        if (getBlog) {
            res.status(200).json(getBlog);
        } else {
            res.status(501).json("Not found new");
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const deleteBlog = async (req, res, next) => {
    try {
        const deleteNew = await Blog.findByIdAndDelete(req.params.newId);
        if (deleteNew) {
            res.status(200).json({
                err: 1,
                message: "Delete new successfully",
            });
        } else if (!deleteNew) {
            res.status(501).json("Not found");
        }
        // res.status(201).json(abc);
    } catch (error) {
        res.status(500).json(error);
        next(error);
    }
};

// controller comment

const getComment = async (req, res, next) => {
    try {
        const newId = req.params.newId;
        const getNew = await Blog.findById(newId).populate({
            path: "comment.userId",
            select: "_id image userName email ",
        });
        if (getNew) {
            res.status(200).json({
                err: 1,
                message: "Successfully",
                response: getNew || "No comment",
            });
        } else {
            res.status(501).json("Not found new");
        }
    } catch (error) {
        res.status(500).json(error);
        next(error);
    }
};

const postComment = async (req, res, next) => {
    try {
        const { comment } = req.body;
        const userId = req.user;
        const newId = req.params.newId;
        const getNew = await Blog.findById(newId).populate({
            path: "comment.userId",
            select: { _id: 1, image: 1, userName: 1, email: 1 },
        });

        if (getNew) {
            const user = await Users.findById(userId).select([
                "userName",
                "email",
                "image",
                "dateOfBirth",
            ]);
            if (user) {
                getNew.comment.push({ userId: userId, comment: comment });
                await getNew.save();
                io.emit("post-comment", getNew);
                res.status(200).json({
                    err: 1,
                    message: "Successfully",
                    response: getNew,
                });
            } else {
                res.status(501).json("Not found user");
            }
        } else {
            res.status(501).json("Not found new");
        }
    } catch (error) {
        res.status(500).json(error);
        next(error);
    }
};

const putComment = async (req, res, next) => {
    try {
        const newId = req.params.newId;
        const userId = req.user._id;
        const { comment, commentId } = req.body;

        const commentTrim = comment.trim();
        const getNew = await Blog.findById(newId);
        if (!comment || !commentId) {
            res.status(400).json({
                err: -1,
                message: "Invalid data",
                comment: comment,
                commentId: commentId,
            });
        } else {
            if (getNew && commentTrim.length > 0) {
                getNew?.comment?.forEach(async (item, index) => {
                    if (
                        item.userId.equals(userId) &&
                        item._id.equals(commentId)
                    ) {
                        getNew.comment[index].comment = commentTrim;
                        await getNew.save();
                        io.emit("put-comment", getNew);
                    }
                });
                res.status(201).json(getNew);
            } else {
                res.status(500).json({
                    err: -1,
                    message: "Not found new or comment is invalid",
                });
            }
        }
    } catch (error) {
        res.status(500).json(error);
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
    try {
        const newId = req.params.newId;
        const userId = req.user._id;
        const { commentId } = req.body;

        const getNew = await Blog.findById(newId);
        if (getNew) {
            const notfind = { ms: false };
            if (getNew?.comment?.length > 0) {
                getNew?.comment?.forEach(async (item, index) => {
                    if (
                        item.userId.equals(userId) &&
                        item._id.equals(commentId)
                    ) {
                        getNew.comment.splice(index, 1);
                        await getNew.save();
                        io.emit("delete-comment", getNew);
                        res.status(200).json("Deleted comment");
                    } else {
                        notfind.ms = true;
                    }
                });
                if (notfind.ms === true) {
                    res.status(400).json(
                        "Can't delete other people's comments"
                    );
                }
            }
        } else {
            res.status(500).json("Not found new");
        }
    } catch (error) {
        res.status(500).json(error);
        next(error);
    }
};
module.exports = {
    addBlog,
    putBlog,
    deleteBlog,
    getNew,
    getAllBlog,
    getComment,
    postComment,
    putComment,
    deleteComment,
};
