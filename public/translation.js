function highlightText() {
  const textArea = document.getElementById("text-area");
  const selectedText = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);

  if (selectedText.length > 0) {
    console.log("Selected word:", selectedText);

    // Fetch translation from the server
    fetch(`/translate?word=${encodeURIComponent(selectedText)}`)
      .then(response => response.json())
      .then(data => {
        const translation = data.translation;
        const language = data.language;


        const popup = document.getElementById("translation-popup");
        document.getElementById("translation-text").textContent = `The translation of '${selectedText}' is: ${translation}`;
        popup.style.display = "block";

        fetch('/save-word', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word: selectedText, translation: translation, language: language })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Word and translation saved:', data);
        })
        .catch((error) => {
          console.error('Error saving word:', error);
        });

      })
      .catch(error => {
        console.error('Error during translation:', error);
      });
  } else {
    console.log("No text selected");
  }
}

function closePopup() {
  document.getElementById("translation-popup").style.display = "none";
}

document.getElementById("text-area").addEventListener("mouseup", highlightText);
document.getElementById("close-popup-button").addEventListener("click", closePopup);
