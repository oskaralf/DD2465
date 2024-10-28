// JavaScript to handle the sliding popup
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-generation-btn");
  const slidingPopup = document.getElementById("sliding-popup");
  const nextStepBtn = document.getElementById("next-step-btn");
  const generateTextBtn = document.getElementById("generate-text-btn");
  const steps = document.querySelectorAll(".step");
  let currentStep = 0;

  // Function to move to the next step
  function nextStep() {
    steps[currentStep].classList.remove("active");
    currentStep++;
    steps[currentStep].classList.add("active");
  }

  // Start the process
  startBtn.addEventListener("click", () => {
    slidingPopup.classList.add("active");
    steps[0].classList.add("active"); // Show the first step
  });

  // Move to text type selection (next step)
  nextStepBtn.addEventListener("click", () => {
    nextStep();
  });

  // Generate text and close the popup
  generateTextBtn.addEventListener("click", () => {
    const selectedTopic = document.getElementById("topic-select").value;
    const selectedTextType = document.getElementById("text-type-select").value;

    // Simulate text generation based on selections
    const generatedText = `Generated ${selectedTextType} on ${selectedTopic}`;
    document.getElementById("text-area").value = generatedText;

    // Close the popup
    slidingPopup.classList.remove("active");
  });
});
