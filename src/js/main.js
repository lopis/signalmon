(function() {
  const c = document.getElementById('app')
  c.width = document.body.clientWidth
  c.height = document.body.clientHeight
  const canvas = TC(c)

  const ds = new DrawService()
  const game = new Game()

  const mainLoop = () => {
    try {
      ds.draw(canvas)
      ds.drawMoodBars(canvas, game.state.mood)
      ds.drawWiflies(canvas, game.state.wiflies)
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
