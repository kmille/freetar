scroll_timeout = 500;
do_scroll = true;

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
    const current = $('#transpose .current')
    const plus = $('#transpose .plus')
    const minus = $('#transpose .minus')
    current.text(transpose_value)
    plus.click(function () {
        transpose_value = Math.min(11, transpose_value + 1)
        current.text(transpose_value)
        transpose()
    });
    minus.click(function () {
        transpose_value = Math.max(-11, transpose_value - 1)
        current.text(transpose_value)
        transpose()
    });

    $('#song_tab').find('strong').each(function () {
        const text = $(this).text()
        $(this).attr('data-original', text)
    })

    function transpose() {
        $('#song_tab').find('strong').each(function () {
            const text = $(this).attr('data-original')
            const new_text = transpose_chord(text.trim(), transpose_value)
            $(this).text(new_text)
        });
    }

    function transpose_chord(chord, transpose_value) {

        if (chord.indexOf('/') !== -1) {
            const transposed = chord.split('/').map(cho => transpose_chord(cho, transpose_value))
            console.log(chord, transposed, transpose_value)
            return transposed.join('/')
        }

        const variations = ['', 'dim', 'm', 'm7', 'maj7', '7', 'sus4', 'sus2', 'sus', 'dim7', 'min7b5', '7sus4', '6']
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', "A", 'A#', 'B']

        const chords = notes.map(note => variations.map(variation => note + variation))
        
        const chord_index = chords.findIndex(chordGroup => chordGroup.includes(chord))
        if (chord_index === -1) {
            return chord
        }
        let new_index = (chord_index + transpose_value) % 12
        if (new_index < 0) {
            new_index += 12
        }

        return chords[new_index][chords[chord_index].indexOf(chord)]
    }
}


$(document).ready(function () {
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
        document.documentElement.setAttribute('data-bs-theme', 'dark')
    }

    initialise_transpose();

});

function pageScroll() {
    console.log(scroll_timeout);
    window.scrollBy(0, 3);
    if (do_scroll) {
        scrolldelay = setTimeout(pageScroll, scroll_timeout);
    }
}

$('#checkbox_autoscroll').click(function () {
    if ($(this).is(':checked')) {
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
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem("dark_mode", false);
    }
    else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem("dark_mode", true);
    }
});

