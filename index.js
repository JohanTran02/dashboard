// import "/storage.js";
"use strict";
import axios from "axios";
//import.meta.env.VITE_TEST

const my_api_key = import.meta.env.VITE_WEATHER_TOKEN;
const unplash_key = import.meta.env.VITE_UNSPLASH_TOKEN;
const map_token = import.meta.env.VITE_MAP_TOKEN;
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

//Skapar faviconen beroende på om det är för länkar eller vädret
function createImage(type = "", url = "") {
    if (!url) {
        return;
    }

    const image = new Image();
    let image_src = "";
    switch (type) {
        case "site":
            image_src = `https://www.google.com/s2/favicons?sz=32&domain_url=${url}`;
            break;
        case "weather":
            image_src = `https://openweathermap.org/img/wn/${url}@2x.png`;
            break;
    }

    //Anger src och alt för bilden
    image.src = image_src;
    image.alt = url;
    return image;
}

const button_link = document.querySelector(".dashboard-button-link");
button_link.addEventListener("click", function () {
    createCardElement("site")
});

//Skapar korten inuti dashboarden
function createCardElement(type = "", url = "", weather = undefined) {
    const card = document.createElement("div");
    switch (type) {
        case "site":
            card.innerHTML =
                `
            <input class="dashboard-link-title">
            <i class="fa-regular fa-circle-xmark"></i>
            `;
            addURL(card);
            break;
        case "weather":
            card.innerHTML =
                `
                <div class="weather-stats flex">
                <h3 class="weather-day"></h3>
                <div class="weather-temp-stats flex">
                <h3 class="weather-temp"></h3>
                <h3 class="weather-type"></h3>
                </div>
                </div>
                </div>
                `;
            break;
    }

    //Ger de klasser beroende på typ för styling
    card.classList.add(`dashboard-${type}`, "flex");

    const card_link_container = document.querySelector(`.dashboard-${type}-links`);
    card_link_container.append(card);

    //Skapar bild för vädret
    //Om bilden inte är undefined lägg till den i htmln
    const weather_image = createImage(type, url);

    if (weather_image && type === "weather") {
        weather_image.classList.add("weather-icon");

        const day = Intl.DateTimeFormat("sv-SE", { weekday: "long" }).format(new Date(weather.dt_txt));
        const weather_day = card.querySelector(".weather-day");
        const weather_temp = card.querySelector(".weather-temp");
        const weather_type = card.querySelector(".weather-type");

        weather_day.textContent = day;
        weather_temp.textContent = `${Math.round(weather.main.temp)}\u2103`;
        weather_type.textContent = weather.weather[0].main;

        card.prepend(weather_image);
    }
}

//När man skriver en länk lägger den till ett kort med namn på sidan och favicon
function addURL(card) {
    const input = card.querySelector(".dashboard-link-title");

    //När inputen går ut ur fokus eller när man trycker enter visas bild och namn på länken
    input.addEventListener("focusout", () => {
        const url = input.value;
        input.value = url.split(".")[0].charAt(0).toUpperCase() + url.split(".")[0].slice(1);
        const favicon = createImage("site", url);
        card.prepend(favicon);
        input.disabled = true;
        input.blur();
    });

    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            input.blur();
            event.preventDefault();
        }
    })

    //Tar bort kortet när man klickar på krysset
    const delete_card = card.querySelector(".fa-circle-xmark");
    delete_card.addEventListener("click", function () {
        this.parentNode.remove();
    });
}

const getWeatherApi =
    async (weather_location) => {
        try {
            const weather = await axios(`https://api.openweathermap.org/data/2.5/forecast?q=${weather_location}&units=metric&appid=${my_api_key}`);
            return weather.data;
        }
        catch (e) {
            console.error(e.response.data.message);
            const weather_card = document.querySelector(".dashboard-weather-links");
            weather_card.textContent = e.response.data.message;
            return;
        }
    }

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPos, showErr);
    }
}

async function showPos(pos) {
    try {
        const weather = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${my_api_key}`);
        await createWeatherStats(weather.data, 3);
    }
    catch (e) {
        return;
    }
}

function showErr(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

const position = document.querySelector(".position");

position.addEventListener("click", () => {
    getLocation();
});

function getInputValue() {
    const input = document.querySelector(".dashboard-button-weather");
    let location = "";

    input.addEventListener("focusout", () => {
        location = input.value;
    });

    input.addEventListener("focusout", async () => {
        const weather = await getWeatherApi(location);

        if (weather) {
            await createWeatherStats(weather, 3);
        }
    });

    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            location = input.value;
            input.blur();
            event.preventDefault();
        }
    });
}

async function createWeatherStats(weather, amount) {
    const weather_list = document.querySelector(".dashboard-weather-links");

    if (weather_list.hasChildNodes()) {
        weather_list.replaceChildren();
    }

    amount = amount >= 5 ? 5 : amount;
    const weather_times = await nearestTime(weather);

    for (let i = 0; i < amount; i++) {
        createCardElement("weather", weather_times[i].weather[0].icon, weather_times[i]);
    }
}

async function nearestTime(weather) {
    //Ta timmen just nu och kolla vad som är närmast tiden i listan 
    //Ta sedan weather statsen från just dem 
    const indexArr = await weather.list.map(weather_item => {
        return Math.abs(new Date() - new Date(weather_item.dt_txt));
    });

    const nearestTime = indexArr.indexOf(Math.min(...indexArr));
    const weather_nearest_time = weather.list.filter(weather_item => weather_item.dt_txt.includes(new Intl.DateTimeFormat("sv-SE", { hour: "numeric", minute: "numeric", second: "numeric" }).format(new Date(weather.list[nearestTime].dt_txt))));

    return weather_nearest_time;
}

async function getUnsplash() {
    try {
        const images = await axios(`https://api.unsplash.com/photos/?client_id=${unplash_key}`);
        return images.data.map(image => {
            return {
                alt: image.alt_description,
                description: image.description,
                src: image.urls.full,
                height: image.height,
                width: image.width
            }
        });
    }
    catch (e) {
        return;
    }
}

let images, imageURL, oldImage, newImage;
async function renderImages() {
    const content = document.querySelector(".content");
    if (!images) {
        images = await getUnsplash();
        imageURL = await Promise.all(images.map(async (image) => {
            const imageContent = await imageOnLoad(image);
            content.append(imageContent);
            return imageContent;
        }));
        const random = Math.floor(Math.random() * imageURL.length);
        imageURL[random].classList.add("fade-in");
        oldImage = imageURL[random];
    }
    else {
        const random = Math.floor(Math.random() * imageURL.length);
        newImage = imageURL[random];
        setTimeout(() => {
            if (oldImage) {
                oldImage.classList.remove("fade-in");
            }
            setTimeout(() => {
                if (imageURL[random].complete) {
                    newImage.classList.add("fade-in");
                    oldImage = newImage;
                }
            }, 100);
        }, 100);
    }
}

async function imageOnLoad(imgObj) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = imgObj.src;
        image.alt = imgObj.alt;
        image.classList.add("fade-image");
    });
}

const background_button = document.querySelector(".random-background-button");
background_button.addEventListener("click", () => {
    renderImages();
});

document.addEventListener("DOMContentLoaded", () => {
    renderImages();
});

mapboxgl.accessToken = map_token;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [-74.5, 40], // starting position [lng, lat]
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    zoom: 9 // starting zoom
});

const nav = new mapboxgl.NavigationControl();

map.addControl(nav);
map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken
    }),
    'top-left'
);

getInputValue();