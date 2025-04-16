console.log('Lets write a JS');
let currentSong = new Audio();
let songs;
let currFolder;
let play = document.querySelector("#play"); // Ensure play button exists

// Converts seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch songs from the server
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

   // Show all the songs in the playlist
   let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
   songUL.innerHTML = ""
   for (const song of songs) {
     songUL.innerHTML += `<li>
                           <img class="invert" src="img/music.svg" alt="">
                           <div class="info">
                             <div>${song.replaceAll("%20", " ")}</div>
                             <div> Sankalp </div>
                           </div>
                           <div class="playnow">
                             <span>Play Now</span>
                             <img class="invert" src="img/play.svg" alt="">
                           </div>
                          </li>`;
   }
 
   // Attach event listener to each song
   Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
     e.addEventListener("click", () => {
       playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
     });
   });
return songs
  
}

// Play the selected music track
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/`+ track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg"; // Change play button to pause
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let CardContainer = document.querySelector(".CardContainer")
  let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];

    if(e.href.includes("/songs")){
      let folder =(e.href.split("/").slice(-2)[0])
      //get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
      let response = await a.json();
      CardContainer.innerHTML = CardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4L19 12L5 20Z" stroke="#141834" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
    }
    
  };

// Load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e=>{
  e.addEventListener("click", async item=>{
    console.log(item.target, item.currentTarget.dataset);
    
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    playMusic(songs[0])
    
  })
})

}
// Initialize the music player
async function main() {
  //get list of all songs 
await getSongs("songs/ncs");
  playMusic(songs[0], true); 

//display all the albums on the page
displayAlbums()

  // Attach an event listener to play/pause button
  if (play) {
    play.src = "img/play.svg"; // Initially show play button
    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg"; // Show pause button when playing
      } else {
        currentSong.pause();
        play.src = "img/play.svg"; // Show play button when paused
      }
    });
  }

  // Listen for time update to show current time and duration
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
  });
//add an event listener to seekbar
document.querySelector(".seekbar").addEventListener("click",e=>{
  let percent = (e.offsetX / e.target.getBoundingClientRect().width)* 100;
  document.querySelector(".circle").style.left = percent +"%";
  currentSong.currentTime = ((currentSong.duration) * percent)/100
})
//Add an eventlistener for hamburger
document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "0"
})
//Add an eventlistener for close
document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "-120%"
})
//add an event listener to previous and next
previous.addEventListener("click", ()=>{
  console.log("previous Clicked")
  let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]) 
  if((index-1) >= 0){
    playMusic(songs[index-1])
  } 
})
next.addEventListener("click", ()=>{
  currentSong.pause()
  console.log("Next Clicked")
  let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]) 
  if((index+1) < songs.length ){
    playMusic(songs[index+1])
  }
  
})

//add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
  console.log("setting volume to ", e.target.value,"/100");
  currentSong.volume = parseInt(e.target.value)/100
  if(currentSong.volume > 0){
    document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace( "mute.svg","volume.svg") 

  }

})

//Add eventlistener to mute the music
document.querySelector(".volume>img").addEventListener("click",e=>{
  console.log("changing",e.target.src);
  
  if(e.target.src.includes("volume.svg")){
    e.target.src = e.target.src.replace( "volume.svg","mute.svg") 
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value =0;
  }
  else{
    e.target.src = e.target.src.replace( "mute.svg","volume.svg") 
    currentSong.volume = .10;
    document.querySelector(".range").getElementsByTagName("input")[0].value =10;

  }
})



}

main();
