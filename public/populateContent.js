document.getElementById('generate-text-btn').addEventListener('click', () => {
  const topicSelect = document.getElementById('topic-select');
  const selectedTopic = topicSelect.value;

  fetch(`/get-text?topic=${encodeURIComponent(selectedTopic)}`)
    .then(response => response.json())
    .then(data => {
      if (data.content) {
        const textArea = document.getElementById('text-area');
        textArea.value = data.content;
      } else {
        console.error('No content found for the selected topic');
      }
    })
    .catch(error => {
      console.error('Error fetching text:', error);
    });
});
