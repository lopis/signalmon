function Game () {
  this.state = {
    mood: {
      hunger: 1.0,
      sleep: 1.0,
      mood: 1.0
    },
    wiflies: []
  }

  const updateWiflies = () => {
    if (navigator.onLine && Math.random() > 0.99) {
      this.state.wiflies.push({
        x: Math.random(),
        y: Math.random() * 0.2
      })
    }

    this.state.wiflies = this.state.wiflies.map(updatePosition)
  }

  const WIFLY_VELOCITY = 0.02
  const updatePosition = ({x, y, d=0}) => {
    let newDirection = (d + Math.random()) % (2 * Math.PI)

    const newv = {
      x: WIFLY_VELOCITY * Math.cos(newDirection),
      y: WIFLY_VELOCITY * Math.sin(newDirection)
    }

    return {
      x: (x + newv.x < 0.1 || x + newv.x > 0.9) ? x - newv.x: x + newv.x,
      y: (y + newv.y < 0.1 || y + newv.y > 0.9) ? y - newv.y: y + newv.y,
      d: newDirection
    }
  }

  this.init = () => {
    setInterval(updateWiflies, 100)
    this.state.wiflies.push({
      x: 0.5,
      y: Math.random() * 0.3
    })
    updateWiflies()
  }
}
