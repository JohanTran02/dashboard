localStorage.clear();

const dashboard_title = document.querySelector(".dashboard-title");
const dashboard_note_area = document.querySelector(".dashboard-note-area");
const links = document.querySelector(".dashboard-site-links");

document.addEventListener("input", () => {
    localStorage.setItem("dashboard-note-area", dashboard_note_area.textContent);
    localStorage.setItem("dashboard-title", dashboard_title.textContent);
});

export function saveLinks() {
    const site_links = links.innerHTML;
    console.log(site_links);
    if (!site_links) {
        localStorage.setItem("dashboard-site-links", "")
        return;
    }
    localStorage.setItem("dashboard-site-links", links.innerHTML);
    console.log(localStorage.getItem("dashboard-site-links"));
}

function renderLinks() {
    const site_links = localStorage.getItem("dashboard-site-links");
    links.innerHTML = site_links;
}

function renderTitle() {
    if (!dashboard_title.textContent) {
        localStorage.setItem("dashboard-title", "");
        return;
    }
    const title = localStorage.getItem("dashboard-title");
    dashboard_title.textContent = title;
}

function renderNotes() {
    if (!dashboard_note_area) {
        localStorage.setItem("dashboard-note-area", "");
        return;
    }
    const notes = localStorage.getItem("dashboard-note-area");
    dashboard_note_area.textContent = notes;
}

renderLinks();
renderTitle();
renderNotes();