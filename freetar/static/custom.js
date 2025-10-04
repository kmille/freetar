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

    $('.tab').find('.chord-root, .chord-bass').each(function () {
        const text = $(this).text()
        $(this).attr('data-original', text)
    })

    function transpose() {
        $('.tab').find('.chord-root, .chord-bass').each(function () {
            const originalText = $(this).attr('data-original')
            const transposedSteps = $('#transposed_steps')
            if (transpose_value === 0) {
                $(this).text(originalText)
                transposedSteps.hide()
            } else {
                const new_text = transpose_note(originalText.trim(), transpose_value)
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

function initialise_columns() {
    let column_count = 1;
    let original_content = null;
    const columnsCount = $('#columns_count');
    const columnsDown = $('#columns_down');
    const columnsUp = $('#columns_up');
    const tabDiv = $('.tab');

    // Store original content
    if (tabDiv.length > 0) {
        original_content = tabDiv.html();
    }

    columnsUp.click(function () {
        column_count = Math.min(10, column_count + 1);
        applyColumns();
    });

    columnsDown.click(function () {
        column_count = Math.max(1, column_count - 1);
        applyColumns();
    });

    function applyColumns() {
        columnsCount.text(column_count);

        if (!original_content || tabDiv.length === 0) {
            return;
        }

        if (column_count === 1) {
            // Single column - restore original content
            tabDiv.html(original_content);
            tabDiv.css({
                'display': '',
                'grid-template-columns': '',
                'gap': ''
            });
        } else {
            // Multiple columns - split content
            // First, convert <br> tags to newlines for easier splitting
            let htmlContent = original_content.replace(/<br\s*\/?>/gi, '\n');

            // Create a temporary element to extract text while preserving bold tags
            const tempDiv = $('<div>').html(htmlContent);

            // Get HTML content but normalize it to preserve formatting
            let processedHtml = tempDiv.html();

            // Split by newlines while preserving HTML tags
            const lines = processedHtml.split('\n');
            const linesPerColumn = Math.ceil(lines.length / column_count);

            let columnHtml = '<div  style="display: grid; grid-template-columns: repeat(' + column_count + ', 1fr); gap: 2rem;">';

            for (let col = 0; col < column_count; col++) {
                const startLine = col * linesPerColumn;
                const endLine = Math.min(startLine + linesPerColumn, lines.length);
                const columnLines = lines.slice(startLine, endLine);

                columnHtml += '<div  class="font-monospace" style="white-space: pre-wrap;">';
                // Join lines and trim leading/trailing whitespace from the column
                const columnContent = columnLines.join('\n').replace(/^\s+/, '');
                columnHtml += columnContent;
                columnHtml += '</div>';
            }

            columnHtml += '</div>';
            tabDiv.html(columnHtml);
        }
    }

    // Initialize with single column
    applyColumns();
}

$(document).ready(function () {
    colorize_favs();
    initialise_transpose();
    initialise_columns();
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

