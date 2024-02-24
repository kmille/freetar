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
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
    startScrolling();
});

$('#scroll_speed_up').click(function () {
    // Decrease the delay to speed up scroll.
    // Don't decrease the delay all the way to 0
    scrollTimeout = Math.max(50, scrollTimeout - 50);
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
    startScrolling();
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

// Sets `pausedForUserInteraction` to `true` for `delay` miliseconds. 
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

