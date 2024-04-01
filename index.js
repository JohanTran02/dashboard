// import "/storage.js";
"use strict";
import axios from "axios";
import { saveLinks } from "./storage";

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

//Skapar korten inuti dashboarden
function createCardElement(type = "", url = "", weather = undefined) {
    const card = document.createElement("div");
    switch (type) {
        case "site":
            card.innerHTML =
                `
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

const input = document.querySelector(".dashboard-link-title");

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        createCardElement("site");
        input.blur();
        event.preventDefault();
        saveLinks();
        input.value = "";
    }
})

//När man skriver en länk lägger den till ett kort med namn på sidan och favicon
function addURL(card) {
    const site_link = document.createElement("a");
    const url = input.value;
    site_link.textContent = url.split(".")[0].charAt(0).toUpperCase() + url.split(".")[0].slice(1);
    site_link.href = `https://www.${url}/`;
    const favicon = createImage("site", url);
    card.prepend(favicon);
    card.append(site_link);
}

//Tar bort kortet när man klickar på krysset
const dashboard_links = document.querySelector(".dashboard-site-links");
dashboard_links.addEventListener("click", function (event) {
    if (event.target.className.includes("fa-circle-xmark")) {
        event.target.parentNode.remove();
        saveLinks();
    }
});

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

function getWeatherValue() {
    const input = document.querySelector(".dashboard-weather-input");
    let location = "";

    input.addEventListener("focusout", async () => {
        const weather = await getWeatherApi(location);

        if (weather) {
            await createWeatherStats(weather, 3);
        }
    });

    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            location = input.value;
            event.preventDefault();
            input.blur();
            input.value = "";
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

async function getUnsplash(theme) {
    try {
        const images = await axios(`https://api.unsplash.com/photos/random?count=10&query=${theme}&client_id=${unplash_key}`);
        return images.data.map(image => {
            return {
                alt: image.alt_description,
                src: image.urls.full,
            }
        });
    }
    catch (e) {
        console.error(e);
        return;
    }
}

let fetchedImages, renderedImages, oldImage, newImage, oldRandomIndex = 0;
async function renderImages(theme = "") {
    const pictures = document.querySelector(".pictures");

    if (pictures.hasChildNodes()) {
        await replaceImages(pictures, theme);
        return;
    }

    await appendImages(pictures, theme);
}

async function replaceImages(pictures, theme) {
    let count = 0;
    fetchedImages = await getUnsplash(theme);

    renderedImages = await Promise.all(fetchedImages.map(async (image) => {
        const imageContent = await imageOnLoad(image);
        imageContent.classList.add("fade-image");
        if (count == 0) {
            oldImage = imageContent;
        }
        pictures.childNodes[count].replaceWith(imageContent);
        count++;
        return imageContent;
    }));

    oldImage.classList.add("fade-in");
    count = 0;
}

async function appendImages(pictures, theme) {
    let count = 0;
    fetchedImages = await getUnsplash(theme);

    renderedImages = await Promise.all(fetchedImages.map(async (image) => {
        const imageContent = await imageOnLoad(image);
        imageContent.classList.add("fade-image");

        if (count == 0) {
            oldImage = imageContent;
        }

        pictures.append(imageContent)
        count++;
        return imageContent;
    }));

    oldImage.classList.add("fade-in");
    count = 0;
}

function changeImage() {
    if (!renderedImages) return;
    const randomIndex = randomNumber(renderedImages, oldRandomIndex);
    oldRandomIndex = randomIndex;
    newImage = renderedImages[randomIndex];

    if (newImage.complete) {
        setTimeout(() => {
            if (oldImage) {
                oldImage.classList.remove("fade-in");
            }
            setTimeout(() => {
                newImage.classList.add("fade-in");
            }, 100);
            oldImage = newImage;
        }, 100);
    }
}

function randomNumber(images, oldIndex) {
    const randomIndex = Math.floor(Math.random() * images.length);
    if (randomIndex !== oldIndex) {
        return randomIndex;
    }
    else {
        return randomNumber(images, oldIndex);
    }
}

async function imageOnLoad(imgObj) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imgObj.src;
        image.alt = imgObj.alt;
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
}

const background_button = document.querySelector(".random-background-button");
const background_input = document.querySelector(".random-background-input");
background_button.addEventListener("click", changeImage);
background_input.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        renderImages(background_input.value);
    }
})

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
map.addControl(new mapboxgl.FullscreenControl(), "bottom-left");

getWeatherValue();
renderImages();