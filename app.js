const music = document.getElementById("music");

const trackName = document.getElementById("trackName");
const trackArtist = document.getElementById("trackArtist");

const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");

const curTimeEl = document.getElementById("curTime");
const durTimeEl = document.getElementById("durTime");
const volRange = document.getElementById("volRange");

const playlist = [
  { name: "losing", artist: "Lonnex", src: "01.mp3" },
  { name: "Chimeras", artist: "Tim Hecker", src: "02.mp3" },
  { name: "Black Tusk Descent", artist: "loscil", src: "03.mp3" },
  { name: "The Bramble Briar", artist: "Martyn Bates i Mick Harris", src: "04.mp3" },
];

let idx = 0;
let fading = false;

function load(i) {
  idx = (i + playlist.length) % playlist.length;
  const t = playlist[idx];
  music.src = t.src;
  trackName.textContent = t.name;
  trackArtist.textContent = t.artist;
}

function updateIcon() {
  playBtn.textContent = music.paused ? "▶" : "⏸";
}

function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function updateTimes() {
  curTimeEl.textContent = fmtTime(music.currentTime || 0);
  durTimeEl.textContent = fmtTime(music.duration || 0);
}

function applyVolume() {
  music.volume = Number(volRange.value);
}

async function fadeToTrack(newIndex) {
  if (fading) return;
  fading = true;

  const startVol = Number(volRange.value) || 0.4;

  for (let v = startVol; v >= 0.02; v -= 0.04) {
    music.volume = Math.max(0, v);
    await new Promise((r) => setTimeout(r, 20));
  }
  music.pause();

  load(newIndex);

  music.volume = 0.02;
  try { await music.play(); } catch (e) {}

  for (let v = 0.02; v <= startVol; v += 0.04) {
    music.volume = Math.min(startVol, v);
    await new Promise((r) => setTimeout(r, 20));
  }

  updateIcon();
  fading = false;
}

volRange.addEventListener("input", applyVolume);

playBtn.addEventListener("click", async () => {
  applyVolume();
  if (music.paused) {
    try { await music.play(); } catch (e) {}
  } else {
    music.pause();
  }
  updateIcon();
});

prevBtn.addEventListener("click", async () => {
  applyVolume();
  if (!music.paused) await fadeToTrack(idx - 1);
  else { load(idx - 1); updateTimes(); updateIcon(); }
});

nextBtn.addEventListener("click", async () => {
  applyVolume();
  if (!music.paused) await fadeToTrack(idx + 1);
  else { load(idx + 1); updateTimes(); updateIcon(); }
});

music.addEventListener("ended", async () => {
  applyVolume();
  await fadeToTrack(idx + 1);
});

music.addEventListener("loadedmetadata", updateTimes);
music.addEventListener("timeupdate", updateTimes);
music.addEventListener("play", updateIcon);
music.addEventListener("pause", updateIcon);

load(0);
applyVolume();
updateIcon();
updateTimes();

const card = document.querySelector(".card");

let cx = 0, cy = 0;
let tx = 0, ty = 0;

const maxMove = 14;   // зміщення в px
const maxTilt = 6;   // нахил у градусах

card.addEventListener("mousemove", (e) => {
  const r = card.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  const px = (x / r.width - 0.5) * 2;
  const py = (y / r.height - 0.5) * 2;

  tx = px * maxMove;
  ty = py * maxMove;
});

card.addEventListener("mouseleave", () => {
  tx = 0;
  ty = 0;
});

function animateTilt(){
  cx += (tx - cx) * 0.12;
  cy += (ty - cy) * 0.12;

  card.style.transform = `
    translate(${cx}px, ${cy}px)
    rotateX(${-cy * maxTilt / maxMove}deg)
    rotateY(${cx * maxTilt / maxMove}deg)
  `;

  requestAnimationFrame(animateTilt);
}

animateTilt();

