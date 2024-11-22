const sendButton = document.querySelector("button")
const input = document.querySelector("input")
const divResult = document.querySelector(".messageResult")
const mdConverter = new showdown.Converter()
const ul = document.querySelector("ul")

// Old messages for the context
let oldMessages = []

function saveMessagesInLocalstorage() {
    localStorage.setItem("messages", JSON.stringify(oldMessages))
}

// Ask the bot a question with the context
async function askBot(IAName) {
    const datas = {
        model: IAName,
        stream: false,
        messages: oldMessages
    }

    const answer = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datas),
    })

    if (!answer.ok) {
        console.error("Error while fetching")
        return false
    }

    return await answer.json()
}

// Function to send a message (put it and his answer in the chat)
async function sendMessage() {
    if (!sendButton.disabled) {
        if (input.value) {

            // Disable the button while building message
            sendButton.disabled = true

            addMessageUser(input.value)
            let li = loading()

            // For ergonomy
            input.value = ""
            input.focus()

            const answer = await askBot("greg")
            li.classList.add("generated")

            sendButton.disabled = false

            addMessageIa(answer.message.content, li)

            saveMessagesInLocalstorage()

            // Scroll down to see all the message
            ul.scrollTo(0, ul.scrollHeight)
        }
    }
}

function loading() {
    const li = document.createElement("li")

    li.textContent = "..."
    li.classList.add("messageIa")
    const ul = document.querySelector("ul")


    ul.appendChild(li)
    return li
}

function addMessageIa(message, li) {
    li.innerHTML = mdConverter.makeHtml(message)

    speak(li)
    if (message)
        oldMessages.push({ role: "assistant", content: message })
    hljs.highlightAll()

}

function addMessageUser(message) {
    const li = document.createElement("li")
    const ul = document.querySelector(".messageResult ul")

    oldMessages.push({ role: "user", content: message })

    li.textContent = message
    li.classList.add("messageUser")

    ul.appendChild(li)
}

function speak(li) {
    const talk = new SpeechSynthesisUtterance(li.textContent);

    talk.lang = navigator.language
    talk.rate = 1.5
    talk.pitch = 1.5;

    speechSynthesis.speak(talk)
}

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("messages")) {
        oldMessages = JSON.parse(localStorage.getItem("messages"))
    }
    else {
        oldMessages.push({ role: "user", content: "You have to talk in the language : " + navigator.language })
    }
})

sendButton.addEventListener("click", sendMessage)
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter")
        sendMessage()
})
