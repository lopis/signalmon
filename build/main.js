(function() {
  const c = document.getElementById('app')
  c.width = window.innerWidth
  c.height = window.innerHeight
  const canvas = TC(c)

  window.ds = new DrawService()

  const moodState = {
    hunger: 0.5,
    sleep: 0.8,
    mood: 0.75
  }

  const mainLoop = () => {
    try {
      ds.draw(canvas)
      ds.drawMoodBars(canvas, moodState)
      requestAnimationFrame(mainLoop);
    } catch (e) {
      console.error(e)
    }
  }

  ds.init(canvas).then(mainLoop)
})();
