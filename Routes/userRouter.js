import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../Models/UserModel.js";
import { generateToken, isAuth } from "../utils.js";

const userRouter = express.Router();
userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    //console.log(user);
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({ _id: user._id, username: user.username, email: user.email, token: generateToken(user) });
        return;
      }
    }
    res.status(401).send({ message: "Invalid Credentials" });
  })
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    try {
      const newUser = new User({ username: req.body.username, email: req.body.email, isAdmin: false, password: bcrypt.hashSync(req.body.password) });
      const user = await newUser.save();
      res.send({ _id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin, token: generateToken(user) });
    } catch (error) {
      //console.log(error.message);
      res.status(400).send({ message: "email already in database" });
    }
  })
);

// userRouter.post(
//   "/signup",
//   expressAsyncHandler(async (req, res) => {
//     try {
//       const existingUser = await User.findOne({ email: req.body.email });
//       if (existingUser) {
//         res.status(400).send({ message: "Email already in use" });
//         return;
//       }

//       const newUser = new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: bcrypt.hashSync(req.body.password),
//       });

//       const user = await newUser.save();
//       res.send({
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         token: generateToken(user),
//       });
//     } catch (error) {
//       res.status(500).send({ message: "An error occurred" });
//     }
//   })
// );

userRouter.get(
  "/",
  expressAsyncHandler(isAuth, async (req, res) => {
    res.status(200).send({ message: "ok" });
  })
);

export default userRouter;
