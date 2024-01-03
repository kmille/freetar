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
    //const current = $('#transpose .current')
    const minus = $('#transpose_down')
    const plus = $('#transpose_up')
    //current.text(transpose_value)
    plus.click(function () {
        transpose_value = Math.min(11, transpose_value + 1)
        //current.text(transpose_value)
        transpose()
    });
    minus.click(function () {
        transpose_value = Math.max(-11, transpose_value - 1)
        //current.text(transpose_value)
        transpose()
    });

    $('.tab').find('.chord-root, .chord-bass').each(function () {
        const text = $(this).text()
        $(this).attr('data-original', text)
    })

    function transpose() {
        $('.tab').find('.chord-root, .chord-bass').each(function () {
            const originalText = $(this).attr('data-original')
            if (transpose_value === 0) {
                $(this).text(originalText)
            } else {
                const new_text = transpose_note(originalText.trim(), transpose_value)
                $(this).text(new_text)
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


$(document).ready(function () {
    colorize_favs();
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

