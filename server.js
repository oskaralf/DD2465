const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;
const apiKey = process.env.DEEPL_API_KEY;
// const apiKey = 'a5243198-1429-4f28-bd94-eec183c76442:fx'


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

app.post('/save-word', async (req, res) => {
  const { word, translation } = req.body;
  const language = 'SV';
  // constant username for now
  const userName = "oskar";
  console.log('posted');

  try {
    // Forward the data to FastAPI backend
    const response = await axios.post('http://localhost:8000/save-word', { 
      word,
      translation,
      language,
      userName
    });

    if (response.data.success) {
      res.json({ success: true, id: response.data.id });
    } else {
      res.status(500).json({ error: 'Failed to save word in backend' });
    }
  } catch (error) {
    console.error('Error saving word:', error);
    res.status(500).json({ error: 'Error saving word' });
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


// insert here an api call to GPT for prompts instead of DB
app.get('/get-text', (req, res) => {
  const topic = req.query.topic;
  const query = 'SELECT content FROM topics WHERE topic = ?'
  if (!topic) {
    return res.status(400).json({ error: 'Missing topic' });
  }
  db.get(query, [topic], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving text' });
    }
    if (row) {
      res.json({ content: row.content });
    }
    else {
      res.status(404).json({ error: 'Topic not found' });
    }
  });
});  

// DeepL translation
app.get('/translate', async (req, res) => {
  const word = req.query.word;
  const targetLang = 'SV';

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

app.listen(port, () => {
  console.log(`Frontend Server is running on http://localhost:${port}`);
});
