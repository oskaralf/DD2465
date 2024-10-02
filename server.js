const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./word.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');

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


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/translation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/translation.html'));
});


app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/profile.html'));
});


app.post('/save-word', (req, res) => {
  const { word, translation, language } = req.body;

  if (word && translation && language) {
    const query = 'INSERT INTO translations (word, translation, language) VALUES (?, ?, ?)';
    db.run(query, [word, translation, language], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error saving data' });
      }
      res.json({ success: true, id: this.lastID });
    });
  } else {
    res.status(400).json({ error: 'Missing word, translation, or language' });
  }
});

app.get('/get-words', (req, res) => {
  const query = 'SELECT word, translation, language FROM translations ORDER BY created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving words' });
    }
    res.json({ words: rows });
  });
});

// Endpoint to use DeepL API for translation
app.get('/translate', async (req, res) => {
  const word = req.query.word;
  const apiKey = 'a5243198-1429-4f28-bd94-eec183c76442:fx';
  const targetLang = 'ES'; 

  try {
    const response = await axios.get('https://api-free.deepl.com/v2/translate', {
      params: {
        auth_key: apiKey,
        text: word,
        target_lang: targetLang
      }
    });

    const translatedText = response.data.translations[0].text;
    res.json({ translation: translatedText, language: targetLang });
  } catch (error) {
    console.error('Error during translation:', error);
    res.status(500).json({ error: 'Translation error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
