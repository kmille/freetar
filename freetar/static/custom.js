/*****************
 * BEGIN SCROLL STUFF
 *****************/

const SCROLL_STEP_SIZE = 3;
const SCROLL_TIMEOUT_MINIMUM = 50;
const SCROLL_DELAY_AFTER_USER_ACTION = 500;

let pausedForUserInteraction = false;
let scrollTimeout = 500;
let scrollInterval = null;
let pauseScrollTimeout = null;

const checkboxAutoscroll = document.getElementById("checkbox_autoscroll");
if (checkboxAutoscroll) {
    checkboxAutoscroll.checked = false;
}


/*****************
* Event Handlers
*****************/

checkboxAutoscroll?.addEventListener("click", function () {
    if (this.checked) {
        startScrolling();
    } else {
        stopScrolling();
    }
});

window.addEventListener("wheel", () => {
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
});

window.addEventListener("touchmove", () => {
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
});

document.getElementById("scroll_speed_down")?.addEventListener("click", function () {
    // Increase the delay to slow down scroll
    scrollTimeout += 50;
    if (scrollInterval !== null)
    {
        pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
        startScrolling();
    }
});

document.getElementById("scroll_speed_up")?.addEventListener("click", function () {
    // Decrease the delay to speed up scroll.
    // Don't decrease the delay all the way to 0
    scrollTimeout = Math.max(SCROLL_TIMEOUT_MINIMUM, scrollTimeout - 50);

    if (scrollInterval !== null)
    {
        pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
        startScrolling();
    }
});


/*******************
 * Scroll Functions
 ******************/

// Scroll the page by SCROLL_STEP_SIZE
// Will not do anything if `pausedForUserInteraction` is set to `true`
function pageScroll() {
    if (pausedForUserInteraction) { return; }

    window.scrollBy(0, SCROLL_STEP_SIZE);
}

// Sets up the `pageScroll` function to be called in a loop every
// `scrollTimeout` milliseconds
function startScrolling() {
    document.getElementById("scroll_speed").innerHTML = (scrollTimeout / 50 - 10) * -1;
    if (scrollInterval) {
        clearInterval(scrollInterval);
    }
    scrollInterval = setInterval(pageScroll, scrollTimeout);
}

// Sets `pausedForUserInteraction` to `true` for `delay` milliseconds. 
// Will stop `pageScroll` from actually scrolling the page
function pauseScrolling(delay) {
    pausedForUserInteraction = true;
    clearTimeout(pauseScrollTimeout);
    pauseScrollTimeout = setTimeout(() => pausedForUserInteraction = false, delay);
}

// Clears the interval that got set up in `startScrolling`
function stopScrolling() {
    clearInterval(scrollInterval);
}


/*****************
 * DONE SCROLL STUFF
 *****************/

function colorize_favs() {
    // make every entry yellow if we faved it before
    const favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    document.querySelectorAll("#results tr").forEach((row) => {
        const tab_url = row.querySelector(".song a")?.getAttribute("href");
        if (tab_url && favorites[tab_url] !== undefined) {
            const favoriteEl = row.querySelector(".favorite");
            if (favoriteEl) {
                favoriteEl.style.color = "#ffae00";
            }
        }
    });
}

function initialise_transpose() {
    let transpose_value = 0;
    const transposedSteps = document.getElementById("transposed_steps");
    const minus = document.getElementById("transpose_down");
    const plus = document.getElementById("transpose_up");

    plus?.addEventListener("click", function () {
        transpose_value = Math.min(11, transpose_value + 1)
        transpose()
    });
    minus?.addEventListener("click", function () {
        transpose_value = Math.max(-11, transpose_value - 1)
        transpose()
    });
    transposedSteps?.addEventListener("click", function () {
        transpose_value = 0
        transpose()
    });

    document.querySelectorAll(".tab .chord-root, .tab .chord-bass").forEach((el) => {
        const text = el.textContent;
        el.setAttribute("data-original", text);
    });

    function transpose() {
        document.querySelectorAll(".tab .chord-root, .tab .chord-bass").forEach((el) => {
            const originalText = el.getAttribute("data-original");
            const transposedSteps = document.getElementById("transposed_steps");
            if (transpose_value === 0) {
                el.textContent = originalText;
                if (transposedSteps) {
                    transposedSteps.style.display = "none";
                }
            } else {
                const new_text = transpose_note(originalText.trim(), transpose_value);
                el.textContent = new_text;
                if (transposedSteps) {
                    transposedSteps.textContent = (transpose_value > 0 ? "+" : "") + transpose_value;
                    transposedSteps.style.display = "";
                }
            }
        });
    }

    // Defines a list of notes, grouped with any alternate names (like D# and Eb)
    const noteNames = [
        ['A'],
        ['A#', 'Bb'],
        ['B','Cb'],
        ['C', 'B#'],
        ['C#', 'Db'],
        ['D'],
        ['D#', 'Eb'],
        ['E', 'Fb'],
        ['F', 'E#'],
        ['F#', 'Gb'],
        ['G'],
        ['G#', 'Ab'],
    ];

    // Find the given note in noteNames, then step through the list to find the
    // next note up or down. Currently just selects the first note name that
    // matches. It doesn't preserve sharp, flat, or any try to determine what
    // key we're in.
    function transpose_note(note, transpose_value) {
        let noteIndex = noteNames.findIndex(tone => tone.includes(note));
        if (noteIndex === -1)
        {
            console.debug("Note ["+note+"] not found. Can't transpose");
            return note;
        }

        let new_index = (noteIndex + transpose_value) % 12;
        if (new_index < 0) {
            new_index += 12;
        }

        // TODO: Decide on sharp, flat, or natural
        return noteNames[new_index][0];
    }
}

document.addEventListener("DOMContentLoaded", function () {
    colorize_favs();
    initialise_transpose();
});


document.getElementById("checkbox_view_chords")?.addEventListener("click", function () {
    const chordVisuals = document.getElementById("chordVisuals");
    if (chordVisuals) {
        chordVisuals.style.display = this.checked ? "" : "none";
    }
});

document.getElementById("download")?.addEventListener("click", function () {
    document.getElementById("download-options").style.display = "block";
});

document.getElementById("download-options")?.addEventListener("click", function () {
    document.getElementById("download-options").style.display = "none";
});

document.getElementById("dark_mode")?.addEventListener("click", function () {
    if (document.documentElement.getAttribute('data-bs-theme') == 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem("dark_mode", false);
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem("dark_mode", true);
    }
});

document.querySelectorAll(".favorite").forEach((item) => {
    item.addEventListener("click", (event) => {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || {};
        const elm = event.currentTarget;
        const tab_url = elm.getAttribute("data-url");
        if (tab_url in favorites) {
            delete favorites[tab_url];
            elm.style.color = "";
        } else {
            const fav = {
                artist_name: elm.getAttribute("data-artist"),
                song: elm.getAttribute("data-song"),
                type: elm.getAttribute("data-type"),
                rating: elm.getAttribute("data-rating"),
                tab_url: elm.getAttribute("data-url"),
            };
            favorites[fav["tab_url"]] = fav;
            elm.style.color = "#ffae00";
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
    });
});

const change_columns = (add) => {
    const tabs = document.querySelector(".tab");
    if (tabs) {
        tabs.style.columnCount = parseInt(tabs.style.columnCount || 1) + add;

        const down = document.querySelector("#columns_down");
        const up = document.querySelector("#columns_up");
        if (["", "1"].includes(tabs.style.columnCount)) {
            down.style.opacity = 0.3;
            down.style.pointerEvents = "none";
        } else if (["", "4"].includes(tabs.style.columnCount)) {
            up.style.opacity = 0.3;
            up.style.pointerEvents = "none";
        } else {
            down.style.opacity = 1;
            up.style.opacity = 1;
            down.style.pointerEvents = "auto";
            up.style.pointerEvents = "auto";
        }
    }
};

change_columns(0);
document.querySelector("#columns_up")?.addEventListener("click", () => change_columns(1));
document.querySelector("#columns_down")?.addEventListener("click", () => change_columns(-1));
