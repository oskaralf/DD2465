
function highlightText() {
  const textArea = document.getElementById("text-area");

  const selectedText = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);

  if (selectedText.length > 0) {
    console.log("mouseup working, selected text:", selectedText);


    fetch(`/translate?word=${encodeURIComponent(selectedText)}`)
      .then(response => response.json())
      .then(data => {
        const translation = data.translation;

        const popup = document.getElementById("translation-popup");
        document.getElementById("translation-text").textContent = `The translation of '${selectedText}' is: ${translation}`;
        popup.style.display = "block";
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
