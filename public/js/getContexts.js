document.addEventListener("DOMContentLoaded", async () => {
  const userName = "oskar";
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/get_contexts?user=oskar",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Axios automatically parses the response, so no need for response.json()
    if (response.ok) {
      const data = await response.json(); // Parse the JSON response
      document.getElementById("examples-output").textContent = data.examples;
    } else {
      document.getElementById("examples-output").textContent =
        "Failed to load examples";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("examples-output").textContent =
      "Error fetching examples";
  }
});
