const express = require("express");
const router = express.Router();
const zod = require("zod");
const { userModel,Account } = require("../models/db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middlewear");
router.use(express.json());

router.get("/working", (req, res) => {
  res.send("working yayay");
});

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});
const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});
const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await userModel.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

router.put("/", authMiddleware, async (req, res) => {
  const { success, data } = updateBody.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }
  const updateFields = {};
  if (data.firstName) {
    updateFields.firstName = data.firstName;
  }
  if (data.lastName) {
    updateFields.lastName = data.lastName;
  }
  if (data.password) {
    updateFields.password = data.password;
  }
  try {
    await userModel.updateOne({ _id: req.userId }, { $set: { updateFields } });
    res.json({
      message: "Updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const existingUser = await userModel.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken/Incorrect inputs",
    });
  }

  const user = await userModel.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const userId = user._id;
  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token: token,
  });
});
router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const existingUser = await userModel.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser._id,
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
    return;
  }
  res.status(411).json({
    message: "Error while logging in",
  });
});
module.exports = router;
