// import "/storage.js";
"use strict";
// import axios from "axios";
//import.meta.env.VITE_TEST

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
        weather_temp.textContent = Math.round(weather.main.temp);
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

const getWeather =
    async () => {
        try {
            const location_stats = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=London&limit=1&appid=${my_api_key}`);
            const location = await location_stats.json();

            try {
                const weather_stats = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location[0].lat}&lon=${location[0].lon}&units=metric&appid=${my_api_key}`);
                const weather = await weather_stats.json();

                return weather;
            }
            catch (e) {
                console.error(e);
            }
        }
        catch (e) {
            console.error(e);
        }
    }

const button = document.querySelector(".dashboard-button-weather");
button.addEventListener("click", () => {
    //Kolla om det man söker på är samma stad
    //Om det är det ska den inte göra en ny fetch
    const weather = getWeather();
    weather.then(weather => {
        createWeatherStats(weather, 3)
    });
});

function createWeatherStats(weather, amount) {
    const weather_list = document.querySelector(".dashboard-weather-links");

    if (weather_list.hasChildNodes()) {
        weather_list.replaceChildren();
    }

    amount = amount >= 5 ? 5 : amount;
    const weather_times = nearestTime(weather);

    for (let i = 0; i < amount; i++) {
        createCardElement("weather", weather_times[i].weather[0].icon, weather_times[i]);
    }
}

function nearestTime(weather) {
    //Ta timmen just nu och kolla vad som är närmast tiden i listan 
    //Ta sedan weather statsen från just dem 
    const indexArr = weather.list.map(weather_item => {
        return Math.abs(new Date() - new Date(weather_item.dt_txt));
    });

    const nearestTime = indexArr.indexOf(Math.min(...indexArr));
    const weather_nearest_time = weather.list.filter(weather_item => weather_item.dt_txt.includes(new Intl.DateTimeFormat("sv-SE", { hour: "numeric", minute: "numeric", second: "numeric" }).format(new Date(weather.list[nearestTime].dt_txt))));

    console.log(weather_nearest_time);
    return weather_nearest_time;
}

