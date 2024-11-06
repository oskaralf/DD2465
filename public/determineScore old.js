document.addEventListener("DOMContentLoaded", () => {
    const ratingButtons = document.querySelectorAll(".rating-button");
    const ratings = [];  // Array to store the ratings

    ratingButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const rating = parseInt(event.target.getAttribute("data-rating"));
            const sentenceBlock = event.target.closest(".sentence-block");

            if (sentenceBlock && rating) {
                const sentence = sentenceBlock.querySelector(".sentence").innerText;

                // Add rating to the ratings array and disable buttons for this sentence
                ratings.push(rating);
                sentenceBlock.querySelectorAll(".rating-button").forEach(btn => btn.disabled = true);

                // Check if all sentences have been rated
                if (ratings.length === 5) {
                    // Calculate the average score
                    const userScore = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
                    console.log(`Average User Score: ${userScore}`);

                    // Send userScore to the server
                    fetch('/saveUserScore', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userScore })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.redirect) {
                            // Redirect to dashboard
                            window.location.href = data.redirect;
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            }
        });
    });
});