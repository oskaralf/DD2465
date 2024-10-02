
function fetchHighlightedWords() {
  fetch('/get-words')
    .then(response => response.json())
    .then(data => {
      const highlightedWordsList = document.getElementById('highlighted-words-list');
      highlightedWordsList.innerHTML = ''; 

      data.words.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.word} (Translated to ${item.language}): ${item.translation}`;
        highlightedWordsList.appendChild(listItem);
      });
    })
    .catch(error => {
      console.error('Error fetching words:', error);
    });
}

document.addEventListener('DOMContentLoaded', fetchHighlightedWords);
