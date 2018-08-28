function Game () {
  this.state = {
    mood: {
      hunger: 1.0,
      sleep: 1.0,
      mood: 1.0
    },
    wiflies: [],
    deadWiflies: [],
    sleeping: false,
    hungry: false,
    sad: false,
  }

  const breedWiflies = () => {
    const {wiflies, deadWiflies} = this.state

    if (navigator.onLine) {
      wiflies.push({
        x: Math.random(),
        y: Math.random() * 0.2
      })
    } else if (wiflies.length > 0) {
      const dead = wiflies.pop()
      dead.isDead = true
      dead.pos = 1.5 - ((dead.x - 0.5)**2)*2*Math.random()
      deadWiflies.push(dead)
    }
    setTimeout(breedWiflies, 9000 * Math.random() + 1000)
  }

  const updateWiflies = () => {
    const {wiflies, deadWiflies} = this.state
    this.state.wiflies = wiflies.map(updatePosition)
    this.state.deadWiflies = deadWiflies.map(updatePosition)
  }

  const WIFLY_VELOCITY = 0.02
  const updatePosition = (props) => {
    const {x, y, d=0, isDead, pos} = props

    if (isDead) {
      newDirection = Math.PI / 2
      return {
        ...props,
        y: y < pos ? y + 2*WIFLY_VELOCITY : y
      }
    } else  {
      let newDirection = (d + Math.random()) % (2 * Math.PI)
      const newv = {
        x: WIFLY_VELOCITY * Math.cos(newDirection),
        y: WIFLY_VELOCITY * Math.sin(newDirection)
      }
      return {
        ...props,
        x: (x + newv.x < 0.1 || x + newv.x > 0.9) ? x - newv.x: x + newv.x,
        y: (y + newv.y < 0.1 || y + newv.y > 0.9) ? y - newv.y: y + newv.y,
        d: newDirection
      }
    }
  }

  const WIFLY_THERESHOLD = 2
  const MINIMUM_BAR_SIZE = 0.01
  const MOOD_SPEED = 0.002
  const SLEEP_SPEED = 0.001
  const updateMood = () => {
    const {wiflies, mood, sad} = this.state
    const newState = this.state
    if (sad) {
      newState.sleep = false
      newState.mood.mood = Math.max(
        MINIMUM_BAR_SIZE,
        mood.mood - wiflies.length * 0.002
      )
    }
    if (wiflies.length > WIFLY_THERESHOLD
      || mood.sleep < 0.1
      || mood.mood < 0.1
      || mood.hunger < 0.1) {
        newState.sad = true
    }
    newState.mood.sleep = Math.max(
      MINIMUM_BAR_SIZE,
      mood.sleep - SLEEP_SPEED
    )
  }

  this.init = () => {
    breedWiflies()
    setInterval(updateWiflies, 100)
    setInterval(updateMood, 1000)
    this.state.wiflies.push({
      x: 0.2,
      y: 0.3
    })
    this.state.wiflies.push({
      x: 0.3,
      y: 0.3
    })
    this.state.wiflies.push({
      x: 0.4,
      y: 0.3
    })
    this.state.wiflies.push({
      x: 0.5,
      y: 0.3
    })
    this.state.wiflies.push({
      x: 0.6,
      y: 0.3
    })
    this.state.wiflies.push({
      x: 0.7,
      y: 0.3
    })
    this.state.wiflies.push({
      x: 0.8,
      y: 0.3
    })
    updateWiflies()
  }
}
