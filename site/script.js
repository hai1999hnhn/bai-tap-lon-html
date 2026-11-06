// Trình phát nhạc thật: giữ bài đang nghe khi chuyển trang (lưu bằng localStorage)
const TRACKS = [
  { title: 'She Neva Know', artist: 'JustaTee', src: 'audio/track1.mp3', c: 'c0' },
  { title: 'Đã Lỡ Yêu Em Nhiều', artist: 'JustaTee', src: 'audio/track2.mp3', c: 'c1' },
  { title: 'Thằng Điên', artist: 'JustaTee', src: 'audio/track3.mp3', c: 'c2' },
  { title: 'Mặt Trời Của Em', artist: 'Phương Ly', src: 'audio/track4.mp3', c: 'c3' },
  { title: 'Im Lặng', artist: 'LK', src: 'audio/track5.mp3', c: 'c4' },
  { title: 'Ngọn Nến Trước Gió', artist: 'LK', src: 'audio/track6.mp3', c: 'c0' },
];
const $ = id => document.getElementById(id);
const audio = new Audio();
const mainBtn = $('main-play'), seek = $('seek'), vol = $('vol');
let cur = 0;
const fmt = s => isNaN(s) ? '0:00' : Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const save = () => { try { localStorage.setItem('sw', JSON.stringify({ cur, t: audio.currentTime, v: audio.volume })); } catch (e) { } };

function load(i) {                       
  cur = (i + TRACKS.length) % TRACKS.length;
  const t = TRACKS[cur];
  audio.src = t.src;
  $('p-title').textContent = t.title;
  $('p-artist').textContent = t.artist;
  $('p-cover').className = 'cover mini ' + t.c;
  refresh();
}
function refresh() {                     
  const on = !audio.paused;
  mainBtn.textContent = on ? '❚❚' : '▶';
  document.querySelectorAll('[data-track]').forEach(b => {
    const active = on && +b.dataset.track === cur;
    b.classList.toggle('on', active);
    if (b.id === 'detail-play') b.textContent = active ? '❚❚ Pause' : '▶ Play';
    else b.textContent = active ? '❚❚' : '▶';
  });
}
function play(i) {
  if (i !== undefined && i !== cur) load(i);
  audio.play().catch(() => { });
}
function toggle() { audio.paused ? play() : audio.pause(); }

// khôi phục trạng thái từ trang trước
let st = {};
try { st = JSON.parse(localStorage.getItem('sw')) || {}; } catch (e) { }
audio.volume = st.v ?? 0.8; vol.value = audio.volume;
load(st.cur || 0);
audio.addEventListener('loadedmetadata', () => {
  if (st.t) { audio.currentTime = st.t; st = {}; }
  $('p-dur').textContent = fmt(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  seek.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  $('p-cur').textContent = fmt(audio.currentTime);
  const fill = $('fill'); if (fill) fill.style.width = seek.value + '%';
});
audio.addEventListener('play', refresh);
audio.addEventListener('pause', refresh);
audio.addEventListener('ended', () => play(cur + 1));
seek.addEventListener('input', () => { if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration; });
vol.addEventListener('input', () => { audio.volume = vol.value; });
mainBtn.addEventListener('click', toggle);
$('p-prev').addEventListener('click', () => play(cur - 1));
$('p-next').addEventListener('click', () => play(cur + 1));
document.querySelectorAll('[data-track]').forEach(b => b.addEventListener('click', () => {
  const i = +b.dataset.track;
  (i === cur && !audio.paused) ? audio.pause() : play(i);
}));
setInterval(save, 1000);
window.addEventListener('pagehide', save);

// theo dõi ca sĩ
const follow = $('follow');
if (follow) follow.addEventListener('click', () => {
  const on = follow.textContent === 'Theo dõi';
  follow.textContent = on ? 'Đang theo dõi' : 'Theo dõi';
  $('followers').textContent = on ? '128.401' : '128.400';
});
// lọc theo từ khóa ở trang tìm kiếm
const q = $('q');
if (q) q.addEventListener('input', () => {
  let n = 0;
  document.querySelectorAll('#results .card').forEach(c => {
    const ok = c.textContent.toLowerCase().includes(q.value.toLowerCase());
    c.style.display = ok ? '' : 'none'; if (ok) n++;
  });
  $('count').textContent = 'Tìm thấy ' + n + ' bài hát';
});
