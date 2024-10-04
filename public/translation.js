function saveWord(word, translation, language) {
  fetch('/save-word', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word, translation, language }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Word saved successfully:', data.id);
    } else {
      console.error('Error saving word:', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
}



function highlightText() {
  const textArea = document.getElementById("text-area");
  const selectedText = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);

  if (selectedText.length > 0) {
    const languageSelect = document.getElementById("language-select");
    const targetLang = languageSelect.value;

    fetch(`/translate?word=${encodeURIComponent(selectedText)}&targetLang=${targetLang}`)
      .then(response => response.json())
      .then(data => {
        const translation = data.translation;

        const popup = document.getElementById("translation-popup");
        document.getElementById("translation-text").textContent = `The translation of '${selectedText}' is: ${translation}`;
        popup.style.display = "block";


        saveWord(selectedText, translation, targetLang);
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
