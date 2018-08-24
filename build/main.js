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

  ds.init(canvas)
  .then(() => {
    ds.draw(canvas)
    ds.drawMoodBars(canvas, moodState)
  })
})();
