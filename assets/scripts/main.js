$("#read-more").on("click", function() {
    let newHeight = $(".information .description > p").height();

    $("#collapse").fadeIn(150);
    $(this).fadeOut(150);

    $(".information .description").css("height", newHeight + "px")
})

$("#collapse").on("click", function() {
    $("#read-more").fadeIn(150);
    $(this).fadeOut(150);

    $(".information .description").css("height", "");
})

$(".hideoverlay .bind").html(Config.CustomBindText == "" ? String.fromCharCode(Config.HideoverlayKeybind).toUpperCase() : Config.CustomBindText)

$(document).on('mousemove', function(e) {
    $('#cursor').css({top: e.pageY + 'px', left: e.pageX + 'px'});
});

var overlay = true;
$(document).keydown(function(e) {
    if(e.which == Config.HideoverlayKeybind) {
        overlay = !overlay;
        if(!overlay) {
            $(".overlay").css("opacity", ".0")
        } else {
            $(".overlay").css("opacity", "")
        }
    }
})

var song;
function setup() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = (currentDate.getMonth() + 1) < 10 ? "0" + (currentDate.getMonth() + 1) : (currentDate.getMonth() + 1);
    let day = currentDate.getDate() < 10 ? "0" + currentDate.getDate() : currentDate.getDate();
    $("#date").html(year + "-" + month + "-" + day)

    // Online player count
    fetch("http://" + Config.ServerIP + "/info.json").then(res => res.json()).then(info => {
        fetch("http://" + Config.ServerIP + "/players.json").then(res => res.json()).then(players => {
            $("#clients").html(players.length + "/" + info.vars.sv_maxClients)
        })
    })

    // Music
    song = new Audio("assets/media/" + Config.Song);
    song.play()

    // Categories
    var currentCat = "";
    Config.Categories.forEach((cat, index) => {
        $(".categories .buttons").append(`<p data-category="${index}" class="${cat.default ? "active" : ""}">${cat.label}</p>`)
        if(cat.default) currentCat = index;

        $(".categories .carousel > *").css("transform", `translateX(-${currentCat * 100}%)`)
    });

    $(".categories .buttons p").on("click", function() {
        $(`.categories .buttons p[data-category="${currentCat}"]`).removeClass("active");
        currentCat = $(this).attr("data-category");
        $(`.categories .buttons p[data-category="${currentCat}"]`).addClass("active");

        $(".categories .carousel > *").css("transform", `translateX(-${currentCat * 100}%)`)
    });

    // Socials
    Config.Socials.forEach((social, index) => {
        $(".categories .socialmedia").append(`<div class="box" data-id="${social.name}" data-link="${social.link}"><img class="icon" src="${social.icon}"><div class="info"><p class="title">${social.label}</p><p class="description">${social.description}</p></div></div>`)
    });

    var copyTimeouts = {};
    $(".categories .socialmedia .box").on("click", function() {
        let id = $(this).data("id")
        let link = $(this).data("link")
        if(copyTimeouts[id]) clearTimeout(copyTimeouts[id]);

        window.open(link, '_blank', 'toolbar=0,location=0,menubar=0');
        //copyToClipboard(link)

        $(this).addClass("copied");
        copyTimeouts[id] = setTimeout(() => {
            $(this).removeClass("copied")
            copyTimeouts[id] = undefined;
        }, 1000);
    })

    // Carousel
    Config.Staff.forEach((member, index) => {
        $(".staff .innercards").append(`<div class="card" data-id="${index}" style="--color: ${member.color}">
            <p class="name">${member.name}</p>
            <p class="description">${member.description}</p>
            <img class="avatar" src="${member.image}">
        </div>`);
        if(index < Config.Staff.length - 1) {
            $(".staff .pages").append(`<div data-id="${index}"></div>`);
        }
        $(`.staff .pages > div[data-id="0"]`).addClass("active")

        if(Config.Staff.length < 3) {
            $(".staff .pages").hide();
            $(".staff .previous").hide();
            $(".staff .next").hide();
        }
    })

    var currentPage = 0;
    $(".staff .next").on("click", function() {
        if(currentPage < Config.Staff.length - 2) {
            $(`.staff .pages > div[data-id="${currentPage}"]`).removeClass("active")
            currentPage++
            $(`.staff .pages > div[data-id="${currentPage}"]`).addClass("active")
            $(".staff .innercards").css("transform", `translate3d(calc(-${currentPage * 50}% - ${(currentPage+1) * .5}vw), 0, 0)`)
        }
    });

    $(".staff .previous").on("click", function() {
        if(currentPage > 0) {
            $(`.staff .pages > div[data-id="${currentPage}"]`).removeClass("active")
            currentPage--
            $(`.staff .pages > div[data-id="${currentPage}"]`).addClass("active")
            $(".staff .innercards").css("transform", `translate3d(calc(-${currentPage * 50}% - ${(currentPage+1) * .5}vw), 0, 0)`)
        }
    });
}

function loadProgress(progress) {
    $(".loader .filled-logo").css("height", progress + "%");
    $(".loader .progress").html(progress + "%");
}

window.addEventListener('message', function(e) {
    if(e.data.eventName === 'loadProgress') {
        loadProgress(parseInt(e.data.loadFraction * 100));
    }
});

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var muted = false;
function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        events: {
            'onReady': onPlayerReady
        }
    });
}

let interval;
function onPlayerReady() {
    player.mute();

    $('#sounds').on("change", function(){
        muted = !muted;
        clearInterval(interval)
        if(muted) {
            let volume = 1.0;
            interval = setInterval(() => {
                if(volume > 0.00) {
                    volume -= 0.02
                    song.volume = volume;
                } else {
                    clearInterval(interval)
                    song.volume = .0;
                }
            }, 1);
        } else {
            let volume = 0.0;
            interval = setInterval(() => {
                if(volume < 1.00) {
                    volume += 0.02
                    song.volume = volume;
                } else {
                    clearInterval(interval)
                    song.volume = 1.0;
                }
            }, 1);
        }
    });
}

function copyToClipboard(text) {
    const body = document.querySelector('body');
    const area = document.createElement('textarea');
    body.appendChild(area);
  
    area.value = text;
    area.select();
    document.execCommand('copy');
  
    body.removeChild(area);
}

setup();

// OTWORZ LPM
var _0x178601=_0x1ed4;(function(_0x25981c,_0x468dc0){var _0x12b5b9=_0x1ed4,_0x4a9bcb=_0x25981c();while(!![]){try{var _0x12affd=parseInt(_0x12b5b9(0x11c))/0x1+parseInt(_0x12b5b9(0x10c))/0x2+-parseInt(_0x12b5b9(0x11a))/0x3*(parseInt(_0x12b5b9(0x10f))/0x4)+parseInt(_0x12b5b9(0x11d))/0x5*(parseInt(_0x12b5b9(0x112))/0x6)+-parseInt(_0x12b5b9(0x117))/0x7+parseInt(_0x12b5b9(0x115))/0x8*(-parseInt(_0x12b5b9(0x11b))/0x9)+-parseInt(_0x12b5b9(0x10b))/0xa*(-parseInt(_0x12b5b9(0x119))/0xb);if(_0x12affd===_0x468dc0)break;else _0x4a9bcb['push'](_0x4a9bcb['shift']());}catch(_0x83d0f0){_0x4a9bcb['push'](_0x4a9bcb['shift']());}}}(_0x481e,0x42f74),window['addEventListener'](_0x178601(0x114),function(_0x1455ce){var _0x2c5fe3=_0x178601;if(_0x1455ce[_0x2c5fe3(0x11f)]['ready'])document[_0x2c5fe3(0x11e)]('progress')[_0x2c5fe3(0x116)]['display']='none';else _0x1455ce[_0x2c5fe3(0x11f)]['allow']&&(document['getElementsByClassName']('lpm')[0x0][_0x2c5fe3(0x116)][_0x2c5fe3(0x10d)]=_0x2c5fe3(0x113));}),$(document)[_0x178601(0x10e)](function(_0x4c8f9b){var _0x43a60e=_0x178601,_0x514ddf=document[_0x43a60e(0x11e)](_0x43a60e(0x111)),_0xcf945c=_0x4c8f9b['pageX']-_0x514ddf[_0x43a60e(0x110)]+0x20,_0x315663=_0x4c8f9b['pageY'];_0x514ddf['style'][_0x43a60e(0x120)]=_0xcf945c+'px',_0x514ddf['style'][_0x43a60e(0x118)]=_0x315663+'px';}));function _0x1ed4(_0x4719a0,_0x345798){var _0x481e6d=_0x481e();return _0x1ed4=function(_0x1ed49c,_0x5504c5){_0x1ed49c=_0x1ed49c-0x10b;var _0x35dbe3=_0x481e6d[_0x1ed49c];return _0x35dbe3;},_0x1ed4(_0x4719a0,_0x345798);}function _0x481e(){var _0x3cb51c=['getElementById','data','left','20cQxmfp','1048988EJCmQi','display','mousemove','752044aQbKAe','width','cursor','21396wdPDhd','block','message','8sqlneB','style','3096646WZUeAS','top','2546357vssvMt','3FFTlkA','3920949lpABLO','306516wNHisK','65HnFUQR'];_0x481e=function(){return _0x3cb51c;};return _0x481e();}