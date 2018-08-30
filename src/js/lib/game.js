function Game (e) {
  this.state = {
    hunger: 1.0,
    sleep: 1.0,
    mood: 1.0,
    wiflies: [],
    deadWiflies: [],
    asleep: false,
    hungry: false,
    sad: false,
    bedLevel: 0,
  }

  const breedWiflies = () => {
    const {wiflies, deadWiflies} = this.state

    if (navigator.onLine && wiflies.length < 15) {
      wiflies.push({
        x: Math.random(),
        y: Math.random() * 0.2
      })
    } else if (wiflies.length > 0) {
      const dead = wiflies.pop()
      dead.isDead = true
      dead.pos = 1.6 - ((dead.x - 0.5)**2)*3*Math.random()
      deadWiflies.push(dead)
    }
    setTimeout(breedWiflies, 20000 * Math.random() + 5000)
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
        y: y < pos ? y + 4*WIFLY_VELOCITY : y
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

  const WIFLY_THERESHOLD = 4
  const MINIMUM_BAR_SIZE = 0.01
  const MOOD_SPEED = 0.005
  const SLEEP_SPEED = 0.005
  const updateMood = () => {
    const {wiflies, mood, hunger, sleep, sad, asleep} = this.state
    if (sleep < 0.3) {
      this.setState('asleep', true)
    }
    if (wiflies.length > WIFLY_THERESHOLD) {
      this.setState('asleep', false)
      this.incState('mood', - wiflies.length * 0.002)
    }
    if (sleep < 0.2 || mood < 0.2 || hunger < 0.2) {
        this.setState('sad', true)
    }
    this.incState('sleep', asleep ? SLEEP_SPEED : -SLEEP_SPEED)
    if (asleep && sleep === 1) {
      this.setState('asleep', false)
      this.setState('sad', false)
    }
  }

  this.setState = (key, value) => {
    if (this.state[key] !== value) {
      this.state[key] = value
      e.emit('char:update', this.state)
    }
  }
  this.incState = (key, inc) => {
    const value = this.state[key] + inc
    this.state[key] = value <= MINIMUM_BAR_SIZE ? MINIMUM_BAR_SIZE
      : value >= 1 ? 1
      : value
  }

  this.init = () => {
    breedWiflies()
    setInterval(updateWiflies, 100)
    setInterval(updateMood, 1000)
    updateWiflies()

    e.on('upgrade', () => {
      if (this.state.bedLevel < 3) {
        this.state.bedLevel++
      }
    })
  }
}
