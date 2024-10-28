const express = require("express");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");

const app = express();

// middleware
app.use(express.json());

// routes
app.use(registerRoute);
app.use("/login", loginRoute);

const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
