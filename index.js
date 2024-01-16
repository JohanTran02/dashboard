"use strict";

const seconds = 60;

updateHour();
updateDate();

setInterval(updateHour, seconds * 1000);
setInterval(updateDate, 60000);

//Ändra tiden(timmar) med minutprecision
function updateHour(){
    updateTimeElement("time");
}

//Ändra dagen
function updateDate(){
    updateTimeElement("date");
}

function updateTimeElement(element = ""){
    const timeValue = getTime(element);
    
    const timeElement = document.querySelector(`.${element}`);
    timeElement.innerHTML = timeValue;
}

//Hämta tiden 
function getTime(type = ""){
    const d = new Date();
    let options = {};
    
    if(!type){
        console.log("invalid input");
        return;
    }

    if(type === "time"){
        options = {
            hour: "numeric",
            minute: "numeric"
        };

        const date_time = d.toLocaleTimeString("sv-SE", options);
        return date_time;
    }
    else if(type === "date"){
        options = {
            day: "numeric",
            month: "long",
            year: "numeric"
        };

        const date_date = d.toLocaleDateString("sv-SE", options);
        return date_date;
    }
}