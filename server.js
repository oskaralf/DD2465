const express = require("express");
const session = require("express-session")
const path = require("path");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 3000;
const apiKey = process.env.DEEPL_API_KEY;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For HTML form submissions

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/translation", (req, res) => {
  res.sendFile(path.join(__dirname, "public/translation.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public/profile.html"));
});

app.post('/updateUserScore', (req, res) => {
  const { username } = req.session
  console.log("username", username);
  axios.post('http://127.0.0.1:8000/update-score', {
    name: username,
  })
  .then(response => {
    console.log("successful score update");
    res.json(response.data)
  })
  .catch(error => {
    console.error("failed to update score"); //, error);
    res.status(500).json({ message: "Account not found" });
  });
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  console.log("username", username);
  axios.post('http://127.0.0.1:8000/login-user', {
    name: username,
  })
  .then(response => {
    console.log("successful login");
    req.session.username = username;

    // Send JSON response to redirect the user
    res.redirect('/dashboard.html');
  })
  .catch(error => {
    console.error("Account not found"); //, error);
    res.status(500).json({ message: "Account not found" });
  });
});

app.post('/register', (req, res) => {
  const { name, language, interests } = req.body;

  console.log("Registration data saved:", {
      name: name,
      language: language,
      interests: interests
  });
  req.session.username = name;
  console.log('asdasda')
  axios.post('http://127.0.0.1:8000/register-user', {
    name: name,
    language: language,
    interests: interests
  })
  .then(response => {
    console.log("User score logged in backend:", response.data);
    // Send JSON response to redirect the user
    res.redirect('/determineScore.html');
  })
  .catch(error => {
    console.error("Failed to log user score to backend:"); //, error);
    res.status(500).json({ message: "Failed to log user score to backend" });
  });
});


app.post('/getNewSentence', async (req, res) => {
  const { sentenceHistory } = req.body; // Read level and sentenceHistory from the request body

  try {
    // Call the Python API with the level and sentence history
    const response = await axios.post('http://127.0.0.1:8000/get-registration-sentence', {
      sentenceHistory: sentenceHistory, // Send the entire sentence history as part of the request
    });

    // Send the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Python API:', error);
    res.status(500).json({ error: 'An error occurred while fetching the sentence.' });
  }
});


app.post('/set-initial-level', async (req, res) => {
  const { rating, sentence } = req.body;
  const username = req.session.username;

  try {
    // Make a POST request to the external API
    const response = await axios.post('http://127.0.0.1:8000/set-initial-level', {
        rating: rating,
        sentence: sentence,
        user: username
    });

    // Send the response back to the front end
    res.json({
      success: true,
      id: response.data.id, // Assuming the external API responds with an ID for the saved word
    });
  } catch (error) {
    console.error('Error saving word:', error);

    // Handle the error response to the front end
    res.status(500).json({
      success: false,
      error: 'Error saving word to external API',
    });
  }
});

app.post("/save-word", async (req, res) => {
  console.log("ebnterign serv");
  const { word, translation } = req.body;

  const language = "SV";
  // constant username for now
  const user = req.session.username;
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
  const user = req.session.username;
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
  const user = req.session.username;
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

app.post('/saveUserScore', (req, res) => {
  const { userScore, name, language, interests } = req.body;
  console.log("Score data saved:", { score: userScore });


  axios.post('http://localhost:8000/register-user', {
    name: name,
    score: userScore
  })
  .then(response => {
    console.log("User score logged in backend:", response.data);
    // Send JSON response to redirect the user
    res.json({ message: 'User score saved successfully', redirect: '/dashboard.html' });
  })
  .catch(error => {
    console.error("Failed to log user score to backend:", error);
    res.status(500).json({ message: "Failed to log user score to backend" });
  });
});






app.listen(port, () => {
  console.log(`Frontend Server is running on http://localhost:${port}`);
});
