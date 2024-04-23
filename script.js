console.log("JS Connected | Spotify Clone");

let curr_song = new Audio();
let curr_folder;
let songs;
//function that collects all songs from the folder
async function getSongs(folder) {
    curr_folder = folder;

    let s = await fetch(`http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/songs/${folder}/`);
    let response = await s.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;

    songs = [];

    let lis = div.getElementsByTagName("a");
    // console.log(lis);
    // let len = lis.length;
    // console.log(len)
    for (let i = 0; i < lis.length; i++) {
        const ele = lis[i]
        if (ele.href.includes(".mp3")) {
            // console.log(ele.href.split(`/`).slice(-1)[0])
            songs.push(ele.href.split(`/`).slice(-1)[0]);
        }
        // console.log(songs)
    }
    //adds songs into the songslist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
        <div class="info">
        <img class="invert" src="logos/music-logo.svg" alt="">
        <div>${song.replaceAll("%20", " ").replaceAll(".mp3", "")}</div>
        <div class="play-btn"><img class="invert" src="logos/play.svg" alt=""></div>
        </div>
    </li>`;
    }

    //event listener for audio selection
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(ele => {
        ele.addEventListener("click", () => {
            console.log(ele.querySelector(".info>div").innerHTML);
            playMusic((ele.querySelector(".info>div").innerHTML), true);
        })
    })

    return songs
}

let p_p = document.querySelector(".play-pause-outline>img");

//function that takes a song name and plays music
const playMusic = (track, pause = false) => {
    if (!pause) {
        curr_song.play()
        p_p.src = "http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/pause.svg"
    }
    else {
        curr_song.src = `http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/songs/${curr_folder}/` + track + ".mp3";

        document.querySelector(".song-info").innerHTML = decodeURI(track);
        document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
        curr_song.pause()
    }
}

//for converting secs to mins
function convertSecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return " 0:00"
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    var formattedTime = " " + minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
    return formattedTime;
}

//this displays all the folders inside the songs folder
async function displayAlbums() {
    let s = await fetch(`http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/songs/`);
    let response = await s.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchorTag = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".hits-cards");
    let array = Array.from(anchorTag);
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        // console.log(e.title)
        if (element.href.includes("/songs/")) {
            let folderr = element.href.split("/").slice(-1)[0].replaceAll("%20", " ");
            let s = await fetch(`http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/songs/${folderr}/info.json`);
            let response = await s.json();
            // console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="hit-card" data-folder="${response.title}"> 
            <div class="green-p-btn flex align-items justify-content">
                <img src="logos/play.svg" alt="">
            </div>
            <img src="http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/songs/${folderr}/cover.jpeg" alt="Pl1">
            <h2>${response.title}</h2>
            <p>${response.Description}</p>
        </div>`
        }
    }
    //adding dynamic clicking on the albums
    Array.from(document.getElementsByClassName("hit-card")).forEach(e => {
        // console.log(e)
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder)
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            // playMusic(songs[0])
        })
    })
}

async function main() {

    //this returns an array that contains all the songs
    await getSongs("original");
    // console.log(songs);
    let default_song = songs[0].replace(".mp3", "")
    playMusic(default_song, true)

    await displayAlbums();

    //attach event listeners to play, pause
    let p_p = document.querySelector(".play-pause-outline>img");
    let play = document.querySelector(".play-pause");
    play.addEventListener("click", () => {
        if (curr_song.paused) {
            curr_song.play();
            // play.src="/logos/pause.svg"
            p_p.src = "http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/pause.svg"
        }
        else {
            curr_song.pause();
            // play.src="/logos/play.svg"
            p_p.src = "http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/play.svg"
        }
    })

    //attach timeupdate 
    curr_song.addEventListener("timeupdate", () => {
        // console.log(curr_song.currentTime, curr_song.duration);
        document.querySelector(".song-time").innerHTML = `${convertSecondsToMinutesSeconds(curr_song.currentTime)} /${convertSecondsToMinutesSeconds(curr_song.duration)}`;

        document.querySelector(".circle").style.left = (curr_song.currentTime / curr_song.duration) * 100 + "%";
    })

    //moving the seekbar
    document.querySelector(".seekbar").addEventListener("click", ele => {
        let percent = (ele.offsetX / ele.target.getBoundingClientRect().width) * 100;
        console.log(percent)
        document.querySelector(".circle").style.left = (percent) + "%"
        curr_song.currentTime = (curr_song.duration) * percent / 100
    })

    //making hamburger functional
    document.querySelector(".ham").addEventListener("click", () => {
        document.querySelector(".left-part").style.left = 0;
    });

    //closing the hamburger fxn
    document.querySelector(".cross-sign").addEventListener("click", () => {
        document.querySelector(".left-part").style.left = -100 + "%";
    })

    //setting the song playlist into a button (recent)
    let song_var = 0;
    // document.querySelector(".recentt").addEventListener("click", () => {
    //     if (song_var == "0") {
    //         document.querySelector(".songList").style.display = "block";
    //         song_var = 1;
    //     }
    //     else {
    //         song_var = 0;
    //         document.querySelector(".songList").style.display = "none";
    //     }
    // })

    //adding events to next-song btn
    document.querySelector(".next-song").addEventListener("click", () => {
        console.log("Next Song")
        let index = songs.indexOf(curr_song.src.split("/").slice(-1)[0]); // saves index of current song

        if (index < songs.length) {
            playMusic(songs[index + 1].replace(".mp3", ""), true);
        }
    })

    //adding events to prev-song btn
    document.querySelector(".prev-song").addEventListener("click", () => {
        console.log("Prev Song")
        let index = songs.indexOf(curr_song.src.split("/").slice(-1)[0]);

        playMusic(songs[index - 1].replace(".mp3", ""), true);
    })

    //adding an event to control volume
    document.getElementsByTagName("input")[0].addEventListener("change", e => {
        curr_song.volume = parseInt(e.target.value) / 100;
    })
    //adding mute function
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("sound.svg")){
            e.target.src = e.target.src.replace("http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/sound.svg","http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/mute.svg")
            curr_song.volume=0;
            document.getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/mute.svg","http://127.0.0.1:5500/Web-Dev/Spotify%20Clone/logos/sound.svg")
            curr_song.volume=.2;
            document.getElementsByTagName("input")[0].value=20;
        }
    })
}

main()

