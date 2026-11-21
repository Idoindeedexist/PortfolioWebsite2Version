
const loadScreen = document.getElementById("loadScreen");
const terminal = document.getElementById("terminal");
const musicPlayer = document.getElementById("musicPlayer");
const bgVideo = document.getElementById("bgVideo");
const welcomeText = document.getElementById("welcomeText");
const terminalOutput = document.getElementById("terminalOutput");

const TYPE_SPEED_MS = 35;      
const FIRST_BOOT_MS = 2500;    
const QUICK_BOOT_MS = 900;     
const LEAVE_DELAY_MS = 700;    

let isLeavingPage = false;     

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}


const typingJobs = new Map();

async function typeText(element, text, speed = TYPE_SPEED_MS) {
  const jobNumber = (typingJobs.get(element) || 0) + 1;
  typingJobs.set(element, jobNumber);
  element.textContent = "";

  for (const character of text) {
    if (typingJobs.get(element) !== jobNumber) return;
    element.textContent += character;
    await sleep(speed);
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function hasBootedBefore() {
  try {
    return sessionStorage.getItem("terminalBooted") === "yes";
  } catch (error) {
    return false;
  }
}

function rememberBoot() {
  try {
    sessionStorage.setItem("terminalBooted", "yes");
  } catch (error) {
    console.warn("Could not save boot state:", error.message);
  }
}

const videoSource = bgVideo.querySelector("source");

function startBackgroundVideo() {
  bgVideo.muted = true; 
  const playPromise = bgVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.warn("Background video could not autoplay:", error.message);
    });
  }
}

videoSource.addEventListener("error", () => {
  console.error("Background video failed to load:", videoSource.src);
});
bgVideo.addEventListener("contextmenu", (event) => event.preventDefault());
// If the browser blocked autoplay, try again on the first click
document.addEventListener("click", startBackgroundVideo, { once: true });

async function bootTerminal() {
  startBackgroundVideo();
  await sleep(hasBootedBefore() ? QUICK_BOOT_MS : FIRST_BOOT_MS);
  rememberBoot();

  loadScreen.hidden = true;
  terminal.hidden = false;
  musicPlayer.hidden = false;

  await typeText(welcomeText, `> Welcome, USER. ${getGreeting()}.`);
  await typeText(terminalOutput, "SYSTEM READY. SELECT AN OPTION.");
}

async function goToPage(link) {
  if (isLeavingPage) return;
  isLeavingPage = true;

  const message = link.dataset.message || "LOADING...";
  await typeText(terminalOutput, message);
  await sleep(400);

  loadScreen.hidden = false; 
  await sleep(LEAVE_DELAY_MS);
  window.location.href = link.href;
}

const pageLinks = document.querySelectorAll("a[data-message]");
pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    goToPage(link);
  });
});


window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    isLeavingPage = false;
    loadScreen.hidden = true;
    terminalOutput.textContent = "";
  }
});

const tabButtons = document.querySelectorAll(".tabButton");

tabButtons.forEach((clickedButton) => {
  clickedButton.addEventListener("click", () => {
    tabButtons.forEach((button) => {
      const isActive = button === clickedButton;
      button.setAttribute("aria-pressed", String(isActive));
      document.getElementById(button.dataset.pane).hidden = !isActive;
    });
  });
});


const tracks = [
  { title: "Big Band Snowflakes", file: "assets/nickpanek-big-band-catching-snowflakes-in-nuclear-war-220306.mp3" },
  { title: "Muted Trumpet Cocktail Bar", file: "assets/Alex Morgan - Muted Trumpet Cocktail Bar Minor Set.mp3"},
  { title: "Backseat Bop", file: "assets/kaazoom-backseat-bop-1950s-style-rock-and-roll-song-337029.mp3"  }
];

const backgroundMusic = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");
const prevTrackButton = document.getElementById("prevTrack");
const nextTrackButton = document.getElementById("nextTrack");
const trackName = document.getElementById("trackName");

let currentTrack = 0;

function loadTrack(index) {
  currentTrack = (index + tracks.length) % tracks.length;
  backgroundMusic.src = tracks[currentTrack].file;
  trackName.textContent = `TRACK ${currentTrack + 1}/${tracks.length}: ${tracks[currentTrack].title.toUpperCase()}`;
}

async function playMusic() {
  try {
    await backgroundMusic.play();
    musicButton.textContent = "PAUSE";
  } catch (error) {
    console.warn("Music could not play:", error.message);
    trackName.textContent = "TRACK FILE NOT FOUND";
  }
}

function pauseMusic() {
  backgroundMusic.pause();
  musicButton.textContent = "PLAY";
}

function changeTrack(step) {
  const wasPlaying = !backgroundMusic.paused;
  loadTrack(currentTrack + step);
  if (wasPlaying) playMusic();
}

musicButton.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
});
prevTrackButton.addEventListener("click", () => changeTrack(-1));
nextTrackButton.addEventListener("click", () => changeTrack(1));
loadTrack(0);
bootTerminal();