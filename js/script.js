const sendButton = document.querySelector("button")
const input = document.querySelector("input")
const divResult = document.querySelector(".messageResult")
const mdConverter = new showdown.Converter()
const ul = document.querySelector("ul")
let iaName = "greg"

// Old messages for the context
let oldMessages = []

function saveMessagesInLocalstorage() {
    localStorage.setItem("messages", JSON.stringify(oldMessages))
}

function reloadMessages() {
    const content = localStorage.getItem("messagesList")
    ul.innerHTML = content
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

            const answer = await askBot(iaName)
            li.classList.add("generated")

            sendButton.disabled = false

            addMessageIa(answer.message.content, li, iaName)

            saveMessagesInLocalstorage()

            localStorage.setItem("messagesList", ul.innerHTML)
        }
    }
}

function loading() {
    const li = document.createElement("li")

    li.textContent = "..."
    li.classList.add("messageIa")

    ul.appendChild(li)
    return li
}

function addMessageIa(message, li, iaName) {
    li.innerHTML = `<div class=\"iaSender sender\">${iaName}: </div>` + mdConverter.makeHtml(message)

    speak(li)
    if (message)
        oldMessages.push({ role: "assistant", content: message })
    hljs.highlightAll()

    // Scroll down to see all the message
    ul.scrollTo(0, ul.scrollHeight)
}

function addMessageUser(message) {
    const li = document.createElement("li")
    const ul = document.querySelector(".messageResult ul")

    oldMessages.push({ role: "user", content: message })

    li.innerHTML = "<span class=\"sender\">You: </span>" + message
    li.classList.add("messageUser")

    ul.appendChild(li)

    // Scroll down to see all the message
    ul.scrollTo(0, ul.scrollHeight)
}

async function speak(li) {
    const textContent = li.textContent.split(iaName + ": ").slice(1).toString()

    const talk = new SpeechSynthesisUtterance(textContent);

    talk.lang = navigator.language
    talk.rate = 1.5

    await speechSynthesis.speak(talk)
}

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("messages")) {
        oldMessages = JSON.parse(localStorage.getItem("messages"))
    }
    else {
        oldMessages.push({ role: "user", content: "You have to talk in the language : " + navigator.language })
    }

    reloadMessages()
})

sendButton.addEventListener("click", sendMessage)
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter")
        sendMessage()
})
