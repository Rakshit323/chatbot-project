// DOM Elements
const quickButtons = document.getElementById("quickButtons");
const quickButtonList = quickButtons.querySelectorAll("button");
const chatButton = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const refreshChat = document.getElementById("refreshChat");
const sendButton = document.getElementById("sendButton");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const attachButton = document.getElementById("attachButton");
const fileInput = document.getElementById("fileInput");
let selectedFiles = [];
const attachmentPreview = document.getElementById("attachmentPreview");
const chatBody = document.querySelector(".chat-body");

// Open the chatbot

chatButton.addEventListener("click", function () {

    chatBox.style.display = "flex";
    chatButton.style.display = "none";

    if (chatMessages.children.length === 0) {

        startChat();

    }

});


// Close the chatbot

closeChat.addEventListener("click", function () {

    chatBox.style.display = "none";
    chatButton.style.display = "flex";

});


// Refresh the chatbot
refreshChat.addEventListener("click", async function () {

    await fetch("/reset", {
        method: "POST"
    });

    chatMessages.innerHTML = "";

    quickButtons.style.display = "flex";

    userInput.value = "";
    userInput.disabled = false;

    sendButton.disabled = false;

    attachButton.disabled = false;

    userInput.placeholder = "Type your message...";

    selectedFiles = [];

    fileInput.value = "";

    hideAttachmentPreview();

    startChat();

});

// Utility Functions

function scrollToBottom() {

    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth"
    });

}

function getCurrentTime() {

    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}

function addBotMessage(message) {

    const botMessage = document.createElement("div");

    botMessage.classList.add("bot-message");

    botMessage.innerHTML = `
    <div class="message-wrapper bot-wrapper">

        <div class="bot-bubble">
            ${message}
        </div>

        <div class="message-time">
            ${getCurrentTime()}
        </div>

    </div>
    `;

    chatMessages.appendChild(botMessage);

    requestAnimationFrame(() => {

        scrollToBottom();

    });

}

function addUserMessage(message) {

    const userMessage = document.createElement("div");

    userMessage.classList.add("user-message");

    userMessage.innerHTML = `
    <div class="message-wrapper user-wrapper">

        <div class="message-time">
            ${getCurrentTime()}
        </div>

        <div class="user-bubble">
            ${message}
        </div>

    </div>
    `;

    chatMessages.appendChild(userMessage);

    requestAnimationFrame(() => {

        scrollToBottom();

    });

}

function showTyping() {

    const typingMessage = document.createElement("div");

    typingMessage.classList.add("bot-message");

    typingMessage.id = "typing-message";

    typingMessage.innerHTML = `
        <div class="bot-bubble typing-bubble">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatMessages.appendChild(typingMessage);

    scrollToBottom();

}

function hideTyping() {

    const typingMessage = document.getElementById("typing-message");

    if (typingMessage) {

        typingMessage.remove();

    }

}

async function sendToBot(message) {

    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message
        })
    });

    return await response.json();

}

async function uploadFile(file) {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/upload", {

        method: "POST",

        body: formData

    });

    return await response.json();

}

// Chat Functions

//start chat 
async function startChat() {

    showTyping();

    const data = await sendToBot("start");

    await new Promise(resolve => setTimeout(resolve, 1000));

    hideTyping();

    addBotMessage(data.reply);

}

// Attachment Functions

function getAttachmentHTML(file) {

    let icon = "📁";
    let type = "File";

    const extension = file.name.split(".").pop().toLowerCase();

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
        icon = "🖼️";
        type = "Image";
    }
    else if (extension === "pdf") {
        icon = "📄";
        type = "PDF Document";
    }
    else if (["doc", "docx"].includes(extension)) {
        icon = "📝";
        type = "Word Document";
    }
    else if (extension === "txt") {
        icon = "📃";
        type = "Text File";
    }

    let fileName = file.name;

    if (fileName.length > 20) {

        fileName = fileName.substring(0, 17) + "...";

    }

    return `
        <div class="attachment-card">

            <div class="attachment-icon">
                ${icon}
            </div>

            <div class="attachment-info">

                <div class="attachment-name">
                    ${fileName}
                </div>

                <div class="attachment-type">
                    ${type}
                </div>

            </div>

        </div>
    `;
}

function showAttachmentPreview() {

    attachmentPreview.style.display = "block";

    attachmentPreview.innerHTML = `
    <div class="preview-title">
        📎 ${selectedFiles.length} Attachment${selectedFiles.length > 1 ? "s" : ""}
    </div>
    `;

    selectedFiles.forEach((file, index) => {

        let icon = "bi bi-file-earmark";
        let type = "File";

        const extension = file.name.split(".").pop().toLowerCase();

        if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {

            icon = "bi bi-file-earmark-image";
            type = "Image";

        }

        else if (extension === "pdf") {

            icon = "bi bi-file-earmark-pdf";
            type = "PDF";

        }

        else if (["doc", "docx"].includes(extension)) {

            icon = "bi bi-file-earmark-word";
            type = "Word";

        }

        attachmentPreview.innerHTML += `

        <div class="preview-item">

            <div class="preview-left">

                <i class="${icon}"></i>

                <div>

                    <div class="preview-name">${file.name}</div>

                    <div class="preview-type">${type}</div>

                </div>

            </div>

            <button class="remove-file" data-index="${index}">
                <i class="bi bi-x-lg"></i>
            </button>

        </div>

        `;

    });

    document.querySelectorAll(".remove-file").forEach(button => {

        button.onclick = function () {

            const index = Number(this.dataset.index);

            selectedFiles.splice(index, 1);

            showAttachmentPreview();

            if (selectedFiles.length === 0) {

                hideAttachmentPreview();

                fileInput.value = "";

            }

        };

    });

}

function hideAttachmentPreview() {

    attachmentPreview.style.display = "none";

}

// Send message
async function sendMessage() {

    const message = userInput.value.trim();
    if (message === "" && selectedFiles.length === 0) {
        return;
    }

    // Show user message

    let displayMessage = "";

    if (message !== "") {
        displayMessage = message;
    }

    if (selectedFiles.length > 0) {

        if (displayMessage !== "") {
            displayMessage += "<br>";
        }

        selectedFiles.forEach(file => {

            displayMessage += getAttachmentHTML(file);

        });

    }

    addUserMessage(displayMessage);
    userInput.value = "";

    // Send message to Flask

    showTyping();

    try {

        // Upload all files

        for (const file of selectedFiles) {

            const uploadedFile = await uploadFile(file);

            if (!uploadedFile.success) {

                addBotMessage("Sorry, " + file.name + " could not be uploaded.");

                return;

            }

        }

        const data = await sendToBot(message);

        await new Promise(resolve => setTimeout(resolve, 1000));

        addBotMessage(data.reply);

        if (data.reply === "Thank you! Our team will contact you soon.") {

            userInput.disabled = true;
            sendButton.disabled = true;
            attachButton.disabled = true;
            userInput.placeholder = "Click Refresh to start a new chat";

        }

    }
    finally {

        hideTyping();

        selectedFiles = [];

        fileInput.value = "";

        hideAttachmentPreview();

    }


}

// Event Listeners

quickButtonList.forEach(function (button) {

    button.addEventListener("click", function () {

        userInput.value = button.innerText;

        sendMessage();

        quickButtons.style.display = "none";

    });

});

// Send button

sendButton.addEventListener("click", function () {

    sendMessage();

});


// Press Enter to send

userInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        sendMessage();

    }

});

attachButton.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", () => {

    if (fileInput.files.length === 0) {
        return;
    }

    for (const file of fileInput.files) {

        selectedFiles.push(file);
    }

    showAttachmentPreview();

});

