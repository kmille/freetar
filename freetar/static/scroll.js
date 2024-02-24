// const SCROLL_STEP_SIZE = 3;
const SCROLL_STEP_SIZE = 3;
scroll_timeout = 500;
do_scroll = false;
safePageScroll = debouncedPageScrollFactory(pageScroll);

function pageScroll(timeoutOverride) {
    console.log(scroll_timeout);
    window.scrollBy(0, SCROLL_STEP_SIZE);
    if (do_scroll) {
        safePageScroll();
    }
}

$('#checkbox_autoscroll').click(function () {
    if ($(this).is(':checked')) {
        do_scroll = true;
        safePageScroll();
    } else {
        // scroll_timeout = 500;
        do_scroll = false;
    }
});

$(window).on("scroll", function() {
    // Reset the timeout
    if (do_scroll)
    {
        safePageScroll();
    }
});

$('#scroll_speed_down').click(function () {
    // Increase the delay to slow down scroll
    scroll_timeout += 50;
    if (do_scroll)
    {
        safePageScroll();
    }
});

$('#scroll_speed_up').click(function () {
    // Decrease the delay to speed up scroll
    scroll_timeout -= 50;
    if (do_scroll)
    {
        safePageScroll("blah");
    }
});

function debouncedPageScrollFactory (func) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, scroll_timeout);
    };
}
