// import "/storage.js";
"use strict";
// import axios from "axios";

const my_api_key = "REPLACE";
const seconds = 60;

updateHour();
updateDate();

setInterval(updateHour, seconds * 1000);
setInterval(updateDate, 60000);

//Ändra tiden(timmar) med minutprecision
function updateHour() {
    updateTimeElement("time");
}

//Ändra dagen
function updateDate() {
    updateTimeElement("date");
}

function updateTimeElement(element = "") {
    const timeValue = getTime(element);

    const timeElement = document.querySelector(`.${element}`);
    timeElement.innerHTML = timeValue;
}

//Hämta tiden 
function getTime(type = "") {
    const d = new Date();
    let options = {}, date_value;

    if (!type) {
        console.log("invalid input");
        return;
    }

    switch (type) {
        case "time":
            options = {
                hour: "numeric",
                minute: "numeric"
            };

            date_value = d.toLocaleTimeString("sv-SE", options);
            break;
        case "date":
            options = {
                day: "numeric",
                month: "long",
                year: "numeric"
            };

            date_value = d.toLocaleDateString("sv-SE", options);
            break;
    }
    return date_value;
}

function createFavicon(url) {
    const faviconURL = `https://www.google.com/s2/favicons?sz=32&domain_url=${url}`
    const image = new Image();
    image.src = faviconURL;
    image.alt = url;
    return image;
}

function createCardElement() {
    const card = document.createElement("div");
    card.classList.add("dashboard-link", "flex");
    card.innerHTML =
        `
    <input class="dashboard-link-title"></input>
    <i class="fa-regular fa-circle-xmark"></i>
    `;

    addURL(card);

    const card_link_container = document.querySelector(".dashboard-links");
    card_link_container.append(card);
}

function addURL(card) {
    const input = card.querySelector(".dashboard-link-title");

    input.addEventListener("focusout", () => {
        const url = input.value;
        input.value = url.split(".")[0].charAt(0).toUpperCase() + url.split(".")[0].slice(1);
        input.readOnly = true;
        const favicon = createFavicon(url);
        card.prepend(favicon);
        input.blur();
    });

    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            input.blur();
            event.preventDefault();
        }
    })

    const delete_card = card.querySelector(".fa-circle-xmark");

    delete_card.addEventListener("click", function () {
        this.parentNode.remove();
    });
}

async function getWeather() {
    const weather_stats = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${my_api_key}`);
    const response = await weather_stats.json();

    return response;
}

const button = document.querySelector(".dashboard-button-weather");
const weather = await getWeather();
button.addEventListener("click", () => {
    console.log(weather);
});

const button_link = document.querySelector(".dashboard-button-link");
button_link.addEventListener("click", createCardElement);
