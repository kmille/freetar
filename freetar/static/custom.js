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

const initialise_transpose = (function () {
    let transpose_value = 0;
    const current = $('#transpose .current')
    const plus = $('#transpose .plus')
    const minus = $('#transpose .minus')
    current.text(transpose_value)
    plus.click(function () {
        transpose_value = Math.min(12, transpose_value + 1)
        current.text(transpose_value)
        transpose()
    });
    minus.click(function () {
        transpose_value = Math.max(-12, transpose_value - 1)
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
        const chords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        const chordsWithFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        const chordsMinor = ['Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm']
        const chordsMinorWithFlats = ['Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm']
        const hasSeven = chord[chord.length - 1] === '7'
        if (hasSeven) {
            chord = chord.slice(0, -1)
        }

        let chord_index = chords.indexOf(chord)
        let chordGroup = chords;

        if (chord_index == -1) {
            chord_index = chordsWithFlats.indexOf(chord)
            chordGroup = chordsWithFlats;
        }
        if (chord_index == -1) {
            chord_index = chordsMinor.indexOf(chord)
            chordGroup = chordsMinor;
        }
        if (chord_index == -1) {
            chord_index = chordsMinorWithFlats.indexOf(chord)
            chordGroup = chordsMinorWithFlats;
        }

        if (chord_index == -1) {
            return hasSeven ? chord + '7' : chord
        }

        const new_index = (chord_index + transpose_value) % 12
        if (hasSeven) {
            return chordGroup[new_index] + '7'
        }
        return chordGroup[new_index]
    }
})()


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

    initialise_transpose();

    //set dark mode
    dark_mode = JSON.parse(localStorage.getItem("dark_mode")) || false;
    if (dark_mode) {
        document.documentElement.setAttribute('data-bs-theme', 'dark')
    }

    console.log($('.song-tab strong'))
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

