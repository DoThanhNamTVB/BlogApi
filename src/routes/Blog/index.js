const express = require("express");

const router = express.Router();

const {
    addBlog,
    putBlog,
    deleteBlog,
    getNew,
    getAllBlog,
    postComment,
    deleteComment,
    putComment,
    getComment,
} = require("../../controllers/Blog/BlogController");
const uploadBlog = require("../../middleware/uploadBlogMiddleware");
const { protect } = require("../../middleware/authMiddleware");

router
    .route("/")
    .post(
        protect,
        uploadBlog.array("image", process.env.LIMIT_UPLOAD_IMAGE),
        addBlog
    );
router
    .route("/:newId")
    // sockit key put-new
    .put(
        protect,
        uploadBlog.array("image", process.env.LIMIT_UPLOAD_IMAGE),
        putBlog
    )
    .delete(protect, deleteBlog)
    .get(protect, getNew);

router
    .route("/comment/:newId")
    .get(protect, getComment)
    //key sockit post-comment
    .post(protect, postComment)
    //key sockit put-comment
    .put(protect, putComment)
    //key sockit delete-comment
    .delete(protect, deleteComment);

router.get("/allBlog", protect, getAllBlog);

module.exports = router;
