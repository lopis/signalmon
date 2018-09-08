(function() {
  const c = document.getElementById('canvas')
  c.width = __('#app').clientWidth
  c.height = __('#app').clientHeight
  const canvas = TC(c)

  const e = new Events()
  const ds = new DrawService(e)
  const game = new Game(e)
  const controls = new Controls(e)
  const m = new Microphone()

  const mainLoop = () => {
    try {
      ds.draw(canvas, game.state)
      if (m.hadSoundSpike()) {
        e.emit('sound')
      }
      setTimeout(() => {
        requestAnimationFrame(mainLoop)
      }, 32)
    } catch (e) {
      throw e
    }
  }

  game.init()
  ds.init(canvas).then(mainLoop)
})();
