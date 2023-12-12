scroll_timeout = 500;
do_scroll = true;

function colorize_favs() {
    // make every entry yellow if we faved it before
    favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    $("#results tr").each(function() {
        var tab_url = $(this).find(".song").find("a").attr("href");
        if (favorites[tab_url] != undefined) {
            $(this).find(".favorite").css("color", "#ffae00");
        }
    });

}

$(document).ready(function() {
/*
    $(".favorite").click(function() {
            console.log("fav was clicked");
            favorites = JSON.parse(localStorage.getItem("favorites")) || {};
            var row = $(this).closest("tr");
            var fav = new Map();

            tab_url = row.find(".song").find("a").attr("href");
            if (favorites[tab_url] != undefined) {
                delete favorites[tab_url];
                row.find(".favorite").css("color", "#000000");
            } else {

                fav["artist_name"] = row.find(".artist").text();
                fav["tab_url"] = tab_url;
                fav["song"] = row.find(".song").text();
                fav["type"] = row.find(".type").text();
                fav["rating"] = row.find(".rating").text();

                favorites[fav["tab_url"]] = fav;
               row.find(".favorite").css("color", "#ffae00");
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));
        });
*/

        colorize_favs();

        //set dark mode
        dark_mode = JSON.parse(localStorage.getItem("dark_mode")) || false;
        if (dark_mode) {
            document.documentElement.setAttribute('data-bs-theme','dark')
        }
});


function pageScroll() {
    console.log(scroll_timeout);
    window.scrollBy(0, 3);
    if (do_scroll) {
        scrolldelay = setTimeout(pageScroll, scroll_timeout);
    }
}

$('#checkbox_autoscroll').click(function(){
if($(this).is(':checked')){
    do_scroll = true;
    pageScroll();
} else {
    scroll_timeout = 500;
    do_scroll = false;
}
});

$('#checkbox_view_chords').click(function(){
    if($(this).is(':checked')){
        $("#chordVisuals").toggle();
    } else {
        $("#chordVisuals").toggle();
    }
});

$('#dark_mode').click(function(){
    if (document.documentElement.getAttribute('data-bs-theme') == 'dark') {
        document.documentElement.setAttribute('data-bs-theme','light');
        localStorage.setItem("dark_mode", false);
    }
    else {
        document.documentElement.setAttribute('data-bs-theme','dark');
        localStorage.setItem("dark_mode", true);
    }
});

