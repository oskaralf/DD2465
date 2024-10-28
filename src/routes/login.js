const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (password !== user.password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  res.json(user);
});

module.exports = router;
