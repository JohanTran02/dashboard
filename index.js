import "/storage.js";
"use strict";

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