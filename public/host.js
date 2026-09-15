const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const clear = document.querySelector('.js-clear')
const disableBuzzer = document.querySelector('.js-disable-buzzer')
const enableBuzzer = document.querySelector('.js-enable-buzzer')

const updateBuzzerState = (enabled) => {
  disableBuzzer.disabled = !enabled
  enableBuzzer.disabled = enabled
}

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} joined`
})

socket.on('buzzerState', updateBuzzerState)

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1] }
    })
    .map(user => `<li>${user.name} on Team ${user.team}</li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
})

disableBuzzer.addEventListener('click', () => {
  socket.emit('setBuzzerEnabled', false)
})

enableBuzzer.addEventListener('click', () => {
  socket.emit('setBuzzerEnabled', true)
})

