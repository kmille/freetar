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

$('#checkbox_autoscroll').prop("checked", false);


/*****************
* Event Handlers
*****************/

$('#checkbox_autoscroll').click(function () {
    if ($(this).is(':checked')) {
        startScrolling();
    } else {
        stopScrolling();
    }
});

$(window).on("wheel touchmove", function() {
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
});

$('#scroll_speed_down').click(function () {
    // Increase the delay to slow down scroll
    scrollTimeout += 50;
    if (scrollInterval !== null)
    {
        pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
        startScrolling();
    }
});

$('#scroll_speed_up').click(function () {
    // Decrease the delay to speed up scroll.
    // Don't decrease the delay all the way to 0
    scrollTimeout = Math.max(50, scrollTimeout - 50);

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
    favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    $("#results tr").each(function () {
        var tab_url = $(this).find(".song").find("a").attr("href");
        if (favorites[tab_url] != undefined) {
            $(this).find(".favorite").css("color", "#ffae00");
        }
    });
}

function get_flats_enabled()
{
    return document.getElementById("checkbox_use_flats").checked;
}

function initialise_transpose() {
    let transpose_value = 0;
    const transposedSteps = $('#transposed_steps')
    const minus = $('#transpose_down')
    const plus = $('#transpose_up')
    plus.click(function () {
        transpose_value = Math.min(11, transpose_value + 1)
        transpose()
    });
    minus.click(function () {
        transpose_value = Math.max(-11, transpose_value - 1)
        transpose()
    });
    transposedSteps.click(function () {
        transpose_value = 0
        transpose()
    });
    $("#checkbox_use_flats").click(function() {
        transpose();
    });

    $('.tab').find('.chord-root, .chord-bass').each(function () {
        const text = $(this).text()
        $(this).attr('data-original', text)
    })

    function transpose() {
        use_flats = get_flats_enabled();
        $('.tab').find('.chord-root, .chord-bass').each(function () {
            const originalText = $(this).attr('data-original')
            const transposedSteps = $('#transposed_steps')
            if (transpose_value === 0) {
                $(this).text(originalText)
                transposedSteps.hide()
            } else {
                const new_text = transpose_note(originalText.trim(), transpose_value, use_flats)
                $(this).text(new_text)
                transposedSteps.text((transpose_value > 0 ? "+" : "") + transpose_value)
                transposedSteps.show()
            }
        });
    }

    // Defines a list of notes, grouped with any alternate names (like D# and Eb)
    const noteNames = [
        ['A'],
        ['A#', 'Bb'],
        ['B'],
        ['C'],
        ['C#', 'Db'],
        ['D'],
        ['D#', 'Eb'],
        ['E'],
        ['F'],
        ['F#', 'Gb'],
        ['G'],
        ['G#', 'Ab'],
    ];

    // Find the given note in noteNames, then step through the list to find the
    // next note up or down. Currently just selects the first note name that
    // matches. It doesn't preserve sharp, flat, or any try to determine what
    // key we're in.
    function transpose_note(note, transpose_value, use_flats=false) {

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

        let options = noteNames[new_index];
        let index = 0;
        if (options.length > 1 && use_flats) {
            index = 1;
        }

        return noteNames[new_index][index];
    }
}

$(document).ready(function () {
    colorize_favs();
    initialise_transpose();
});


$('#checkbox_view_chords').click(function(){
    if($(this).is(':checked')){
        $("#chordVisuals").show();
    } else {
        $("#chordVisuals").hide();
    }
});

$('#dark_mode').click(function(){
    if (document.documentElement.getAttribute('data-bs-theme') == 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem("dark_mode", false);
    }
    else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem("dark_mode", true);
    }
});

document.querySelectorAll('.favorite').forEach(item => {
  item.addEventListener('click', event => {
    favorites = JSON.parse(localStorage.getItem("favorites")) || {};
    elm = event.target;
    tab_url = elm.getAttribute('data-url')
    if (tab_url in favorites) {
        delete favorites[tab_url];
        $(elm).css("color", "");
    } else {
      const fav = {
        artist_name: elm.getAttribute('data-artist'),
        song: elm.getAttribute('data-song'),
        type: elm.getAttribute('data-type'),
        rating: elm.getAttribute('data-rating'),
        tab_url: elm.getAttribute('data-url')
      }
      favorites[fav["tab_url"]] = fav;
      $(elm).css("color", "#ffae00");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
  })
})

