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

    $('.tab').find('strong').each(function () {
        const text = $(this).text()
        $(this).attr('data-original', text)
    })

    function transpose() {
        $('.tab').find('strong').each(function () {
            const text = $(this).attr('data-original')
            const new_text = transpose_chord(text.trim(), transpose_value)
            $(this).text(new_text)
        });
    }

    const variations = ['', 'dim', 'm', 'm7', 'maj7', '7', 'sus4', 'sus2', 'sus', 'dim7', 'min7b5', '7sus4', '6', 'm6', '9', 'm9', 'maj9', '11', 'add2', 'add9']
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', "A", 'A#', 'B']
    const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', "A", 'Bb', 'B']

    const chords = notes.map(note => variations.map(variation => note + variation))
    const chordsFlat = notesFlat.map(note => variations.map(variation => note + variation))
        

    function transpose_chord(chord, transpose_value) {
        if (chord.indexOf('/') !== -1) {
            const transposed = chord.split('/').map(cho => transpose_chord(cho, transpose_value))
            return transposed.join('/')
        }
        let chordGroup = chords;
        let chord_index = chords.findIndex(chordGroup => chordGroup.includes(chord))
        if (chord_index === -1) {
            chordGroup = chordsFlat;
            chord_index = chordsFlat.findIndex(chordGroup => chordGroup.includes(chord))
            if (chord_index === -1) {
                return chord
            }
        }
        let new_index = (chord_index + transpose_value) % 12
        if (new_index < 0) {
            new_index += 12
        }

        return chordGroup[new_index][chordGroup[chord_index].indexOf(chord)]
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

