
const dynamicText = `
Hello! My name is Anna. I am 20 years old. I live in a small town. Every day, I go to school. 
After school, I like to read books and play with my dog. My dog is big and friendly. 
On weekends, I visit my grandparents. They live in a house with a garden. 
`;


function populateTextArea() {
  const textArea = document.getElementById('text-area');
  textArea.value = dynamicText; 
}


document.addEventListener('DOMContentLoaded', populateTextArea);