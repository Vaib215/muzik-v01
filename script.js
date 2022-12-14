const searchInput = document.querySelector('[data-role="Search Input"]')
const seek = document.querySelector('#seek')
const resultGrid = document.querySelector("#results")

const updatePlayer = () => {
  const currentTime = (player.currentTime / player.duration * 100)
  seek.value = currentTime
  currTime.innerHTML = (player.currentTime / 60).toFixed(0).toString() + ":" + (+(player.currentTime % 60).toFixed(0)).toString().padStart(2, '0')
  localStorage.setItem('currTime', player.currentTime)
}

const changeSongInfo = (res) => {
  songInfo.innerHTML = ""
  const songName = document.createElement('h3')
  songName.className = "text-indigo-700"
  songName.innerHTML = res.song
  songInfo.append(songName)
  const artistName = document.createElement('small')
  artistName.className = "text-indigo-500"
  artistName.innerHTML = res.singers.slice(0, 30) + (res.singers.length > 30 ? '...' : '')
  songInfo.append(artistName)
  totTime.innerHTML = (+res.duration / 60).toFixed(0).toString() + ":" + (+(+res.duration % 60).toFixed(0)).toString().padStart(2, '0')
}

const changeSong = e => {
  if (e.target.className.includes('cover')) {
    setTimeout(() => {
      togglePause()
      const index = +e.target.id.split('-')[1]
      const results = JSON.parse(localStorage.getItem('results'))
      player.querySelector('source').src = results[index].media_url
      player.load()
      player.play()
      changeSongInfo(results[index])
      localStorage.setItem('currSong', index)
    }, 100)
  }
}

const createResult = (posterUrl, songName, artistName, duration, index) => {
  return `
    <div id="result-${index}" class="cover cursor-pointer rounded-lg overflow-hidden">
      <img src=${posterUrl} alt="music-cover"/>
    </div>
    <b>${songName}</b>
    <div class="flex justify-between">
      <small>${artistName.slice(0, 30) + (artistName.length > 30 ? '...' : '')}</small>
      <small>${+(duration / 60).toFixed(0).toString() + ":" + (+(duration % 60).toFixed(0)).toString().padStart(2, '0')}</small>
    </div>
`
}

const addToResults = arr => {
  resultGrid.innerHTML = ""
  spinner.classList.remove("show")
  arr.forEach((result, index) => {
    const searchResult = document.createElement('div')
    searchResult.className = "result h-auto flex flex-col p-2 rounded-lg overflow-hidden bg-gray-200 text-indigo-800"
    searchResult.innerHTML = createResult(result.image, result.song, result.singers, result.duration, index)
    resultGrid.append(searchResult)
    resultGrid.addEventListener('click', changeSong)
  })
}

const populateResults = async (e) => {
  const query = e.target.value;
  if (query.length > 2) {
    spinner.classList.add("show")
    resultGrid.removeEventListener('click', changeSong)
    const response = await fetch(`https://web-production-f296.up.railway.app/result/?query=${query}`)
    const result = await response.json()
    addToResults(result)
    localStorage.setItem('results', JSON.stringify(result))
  }
}

const togglePause = () => {
  player.paused ? player.play() : player.pause()
  const state = player.paused ? 'play' : 'pause'
  play.querySelector('img').src = `https://img.icons8.com/ios-filled/24/ffffff/${state}--v1.png`
}

play.addEventListener('click', togglePause)

seek.addEventListener('input', () => {
  player.currentTime = (seek.value * player.duration) / 100
})

vol.addEventListener('input', () => {
  player.volume = vol.value / 100
  volP.innerHTML = Math.round(vol.value) + "%"
  localStorage.setItem('volume', player.volume)
})

const init = () => {
  const results = JSON.parse(localStorage.getItem('results'))
  if (results) {
    addToResults(results)
    player.volume = +localStorage.getItem('volume')
    vol.value = +player.volume * 100
    volP.innerHTML = Math.round(vol.value) + "%"
    const currSong = results[+localStorage.getItem('currSong')]
    player.querySelector('source').src = currSong.media_url
    player.load()
    player.currentTime = +localStorage.getItem('currTime')
    changeSongInfo(currSong)
  }
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
    if (callNow) func.apply(context, args);
  }
}

const queryResult = debounce(populateResults, 200);

init()
searchInput.addEventListener('input', queryResult)
player.addEventListener('timeupdate', updatePlayer)