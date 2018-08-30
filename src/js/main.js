(function() {
  const c = document.getElementById('canvas')
  c.width = __('#app').clientWidth
  c.height = __('#app').clientHeight
  const canvas = TC(c)

  const e = new Events()
  const ds = new DrawService(e)
  const game = new Game(e)
  const controls = new Controls(e)

  const mainLoop = () => {
    try {
      ds.draw(canvas, game.state)
      ds.drawMoodBars(canvas, game.state)
      ds.drawWiflies(canvas, game.state.wiflies)
      ds.drawWiflies(canvas, game.state.deadWiflies, true)
      setTimeout(() => {
        requestAnimationFrame(mainLoop)
      }, 32)
    } catch (e) {
      console.error(e)
    }
  }

  game.init()
  ds.init(canvas).then(mainLoop)
})();
