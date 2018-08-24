(function() {
  const c = document.getElementById('app')
  c.width = window.innerWidth
  c.height = window.innerHeight
  const canvas = TC(c)

  const ds = new DrawService()
  ds.init(canvas)
  .then(ds.draw)
})();
