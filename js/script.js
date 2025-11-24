document.getElementById("send-btn").addEventListener("click", () => sendMessage());

function sendMessage(forcedMessage = null) {
    // Use forcedMessage (from mood buttons) or typed input
    let userInput = forcedMessage || document.getElementById("user-input").value;
    if (userInput.trim() === "") return;

    // Show user message
    addMessage(userInput, "user");

    // Add typing indicator
    const typingId = "typing-" + Date.now();
    addMessage("⏳ Bot is typing...", "bot", typingId);

    // Clear input box if typed manually
    if (!forcedMessage) {
        document.getElementById("user-input").value = "";
    }

    // Call backend
    fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
    .then(res => res.json())
    .then(data => {
        // Remove typing indicator
        removeMessage(typingId);

        // Add bot text response
        addMessage(data.response, "bot");

        // Add movie posters if backend sent them
        if (data.movies && data.movies.length > 0) {
            data.movies.forEach(movie => {
                if (movie.poster) {
                    addMovieCard(movie.title, movie.poster);
                }
            });
        }
    })
    .catch(err => {
        // Remove typing indicator on error
        removeMessage(typingId);
        addMessage("⚠️ Error connecting to server.", "bot");
        console.error(err);
    });
}

// Add a chat message to the chatbox
function addMessage(text, sender, id = null) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("p");
    msg.className = sender;
    msg.textContent = text;
    if (id) msg.id = id;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove a message by ID (used for typing indicator)
function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Called when mood button is clicked
function sendMood(mood) {
    sendMessage(`${mood} movies`);
}

// Add a movie card (poster + title) to chat
function addMovieCard(title, posterUrl) {
    const chatBox = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = "movie-card";

    div.innerHTML = `
        <img src="${posterUrl}" alt="${title}" class="poster">
        <p>${title}</p>
    `;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Optional: Enter key sends message
document.getElementById("user-input").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
