const dashboard_title = document.querySelector(".dashboard-title");
const dashboard_note_area = document.querySelector(".dashboard-note-area");
const links = document.querySelector(".dashboard-site-links");

document.addEventListener("input", function (event) {
    if (event.target.className.includes("save")) {
        localStorage.setItem("dashboard-note-area", dashboard_note_area.textContent);
        localStorage.setItem("dashboard-title", dashboard_title.textContent);
    }
});

export function saveLinks() {
    const site_links = links.innerHTML;
    localStorage.setItem("dashboard-site-links", site_links);
}

function renderLinks() {
    const site_links = localStorage.getItem("dashboard-site-links");
    links.innerHTML = site_links;
}

function renderTitle() {
    const title = localStorage.getItem("dashboard-title");
    dashboard_title.textContent = title;
}

function renderNotes() {
    const notes = localStorage.getItem("dashboard-note-area");
    dashboard_note_area.textContent = notes;
}

renderLinks();
renderTitle();
renderNotes();