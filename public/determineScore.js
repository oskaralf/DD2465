let ratingCount = 0;
const sentenceHistory = []

document.getElementById('sentence').innerText = "My name is Tim. My house is red."

async function rateSentence(rating) {
    if (ratingCount >= 5) {
        window.location.href = 'dashboard.html';
        fetch('/set-initial-level', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating, sentence }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log('successfully initiated score', data.id);
            } else {
              console.error('error updating score', data.error);
            }
          })
          .catch(error => console.error('Error:', error));
    } else {
        ratingCount++;
        sentence = document.getElementById('sentence').innerText
        sentenceHistory.push({sentence: sentence, rating: rating})
        try {
            const response = await fetch('/getNewSentence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sentenceHistory: sentenceHistory,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('sentence').innerText = data.sentence;
            } else {
                console.error('Failed to load new sentence');
            }
        } catch (error) {
            console.error('Error loading new sentence:', error);
        }
    }
}