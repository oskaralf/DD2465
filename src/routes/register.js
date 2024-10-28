const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  });

  res.json(user);
});

module.exports = router;
