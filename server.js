const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 3000;
const apiKey = process.env.DEEPL_API_KEY;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./word.db", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to SQLite database");

    db.run(`
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        translation TEXT NOT NULL,
        language TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/translation", (req, res) => {
  res.sendFile(path.join(__dirname, "public/translation.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public/profile.html"));
});

app.post("/save-word", async (req, res) => {
  console.log("ebnterign serv");
  const { word, translation } = req.body;

  const language = "SV";
  // constant username for now
  const user = "oskar";
  console.log("posted");

  try {
    // Forward the data to FastAPI backend
    const response = await axios.post("http://127.0.0.1:8000/save-word", {
      word,
      translation,
      language,
      user,
    });

    if (response.data.success) {
      res.json({ success: true, id: response.data.id });
    } else {
      res.status(500).json({ error: "Failed to save word in backend" });
    }
  } catch (error) {
    console.error("Error saving word:", error);
    res.status(500).json({ error: "Error saving word" });
  }
});

app.get("/get-words", (req, res) => {
  const query =
    "SELECT word, translation, language FROM translations ORDER BY created_at DESC";
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error retrieving words" });
    }
    res.json({ words: rows });
  });
});

// insert here an api call to GPT for prompts instead of DB
app.get("/get-text", async (req, res) => {
  const { context, type } = req.query;
  const user = "oskar";
  try {
    const response = await axios.get("http://127.0.0.1:8000/generate_text", {
      params: {
        user: user,
        context: context,
        text_type: type,
      },
    });

    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error getting contexts:", error);
    res.status(500).json({ error: "Error getting contexts" });
  }
});

// DeepL translation
app.get("/translate", async (req, res) => {
  const word = req.query.word;
  const targetLang = "SV";

  try {
    const response = await axios.get(
      "https://api-free.deepl.com/v2/translate",
      {
        params: {
          auth_key: apiKey,
          text: word,
          target_lang: targetLang,
        },
      },
    );

    const translatedText = response.data.translations[0].text;
    res.json({ translation: translatedText, language: targetLang });
  } catch (error) {
    console.error("Error during translation:", error);
    res.status(500).json({ error: "Translation error" });
  }
});

app.get("/get-contexts", async (req, res) => {
  const user = "oskar";
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/generate_contexts",
      {
        params: {
          user: user,
        },
      },
    );

    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error getting contexts:", error);
    res.status(500).json({ error: "Error getting contexts" });
  }
});

app.get("/get-text-types", async (req, res) => {
  const context = req.query.context;
  try {
    const response = await axios.get(
      "http://127.0.0.1:8000/generate_text_types",
      {
        params: {
          context: context,
        },
      },
    );

    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error getting text types:", error);
    res.status(500).json({ error: "Error getting text types" });
  }
});

app.listen(port, () => {
  console.log(`Frontend Server is running on http://localhost:${port}`);
});
