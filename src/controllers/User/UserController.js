const User = require("../../models/User");
const generateToken = require("../../utils/generateToken");
const cloudinary = require("cloudinary").v2;

//@desc Auth user/set token
//route POST /api/users/auth
//@access public
const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            generateToken(res, user._id);
            res.status(201).json({
                _id: user._id,
                userName: user.userName,
                email: user.email,
            });
        } else {
            res.status(401);
            throw new Error("Invalid email or password");
        }
        res.status(200).json({ message: "Auth user" });
    } catch (error) {
        res.status(error);
        next(error);
    }
};

//@desc Register a new user
//route POST /api/users
//@access public
const registerUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const checkEmail = await User.findOne({ email });
        if (checkEmail) {
            res.status(401);
            throw new Error("User already exits");
        }

        const user = await User.create({
            ...req.body,
        });
        if (user) {
            generateToken(res, user._id);
            res.status(201).json({
                _id: user._id,
                userName: user.userName,
                email: user.email,
            });
        } else {
            res.status(401);
            throw new Error("Invalid data user !");
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};

//@desc Logout user
//route POST /api/users/logout
//@access public
const logoutUser = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "User logged out" });
};

//@desc Get user profile
//route POST /api/users/profile
//@access Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id, {
            userName: 1,
            email: 1,
            image: 1,
            dateOfBirth: 1,
            password: 1,
        });

        if (user) {
            res.status(201).json(user);
        } else {
            res.status(401).json("Not found user data");
        }
    } catch (error) {
        res.status(401);
        next("Fail at getUser : ", error);
    }
};

//@desc Update user profile
//route PUT /api/users/profile
//@access Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user._id });

        const { userName, email, password, dateOfBirth } = req.body;
        const fileUpload = req.file;
        // console.log(fileUpload);

        let resultDeleteImage;
        if (user) {
            user.userName = userName || user.userName;
            user.email = email || user.email;
            user.dateOfBirth = dateOfBirth || user.dateOfBirth;

            if (password) {
                user.password = password;
            }
            if (fileUpload?.path) {
                if (user?.image?.fileName) {
                    await cloudinary.uploader.destroy(
                        user?.image?.fileName,
                        function (error, result) {
                            resultDeleteImage = `${
                                error === undefined
                                    ? "Xóa ảnh trên cloud"
                                    : `Lỗi ${error}`
                            } ${result.result}`;
                        }
                    );
                }
                user.image = {
                    path: fileUpload?.path,
                    fileName: fileUpload?.filename,
                };
            }

            const updateUser = await user.save();
            res.status(201).json({
                _id: updateUser?._id,
                userName: updateUser?.userName,
                email: updateUser?.email,
                image: updateUser?.image,
                dateOfBirth: updateUser?.dateOfBirth,
                resultDeleteImage,
            });
        } else {
            res.status(404);
            throw new Error("User not found");
        }
    } catch (error) {
        res.status(500);
        next(error);
    }
};
module.exports = {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
};
