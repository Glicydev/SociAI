const sendButton = document.querySelector("button")
const input = document.querySelector("input")
const divResult = document.querySelector(".messageResult")
let oldMessages = []

async function askBot(IAName) {
    console.log(oldMessages)
    const datas = {
        model: IAName,
        stream: false,
        messages: oldMessages
    }

    const answer = await fetch("http://localhost:11434/api/generate", {
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

async function sendMessage() {
    addMessageUser(input.value)
    let li = loading()

    const answer = await askBot("greg")
    console.log(answer)
    addMessageIa(answer.response, li)
}

function loading() {
    const li = document.createElement("li")
    li.innerHtml = "..."
    li.classList.add("messageIa")
    const ul = document.querySelector("ul")


    ul.appendChild(li)
    return li
}

function addMessageIa(message, li) {
    li.textContent = message
    speak(message)
    if (message)
        oldMessages.push({ role: "assistant", content: message })
}

function addMessageUser(message) {
    const li = document.createElement("li")
    const ul = document.querySelector(".messageResult ul")

    oldMessages.push({ role: "user", content: message })

    li.textContent = message
    li.classList.add("messageUser")

    ul.appendChild(li)
}

function speak(text) {
    const talk = new SpeechSynthesisUtterance(text);

    talk.lang = navigator.language

    speechSynthesis.speak(talk)
}

sendButton.addEventListener("click", sendMessage)