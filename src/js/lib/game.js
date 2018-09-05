function Game (e) {
  this.state = {
    hunger: 1.0,
    sleep: 1.0,
    mood: 1.0,
    buzzards: [],
    wiflies: [],
    deadWiflies: [],
    asleep: false,
    hungry: false,
    sad: false,
    bedLevel: 0,
  }

  window.getState = () => {
    return this.state;
  }
  window.getProps = () => {
    return this.hadSound;
  }

  const breedWiflies = () => {
    const {wiflies, deadWiflies} = this.state

    if (navigator.onLine && wiflies.length < 15) {
      wiflies.push({
        x: Math.random(),
        y: Math.random() * 0.2
      })
    } else if (!navigator.onLine && wiflies.length > 0) {
      const dead = wiflies.pop()
      dead.isDead = true
      dead.pos = 1.6 - ((dead.x - 0.5)**2)*3*Math.random()
      setTimeout(() => deadWiflies.shift(), 2000)
      deadWiflies.push(dead)
    }
    setTimeout(breedWiflies, 20000 * Math.random() + 5000)
  }

  const updateWiflies = () => {
    const {wiflies, deadWiflies, buzzards} = this.state
    this.state.wiflies = wiflies.map(updatePosition)
    this.state.deadWiflies = deadWiflies.map(updatePosition)
    this.state.buzzards = buzzards.map(updateHPosition)
      .filter(keepAlive)
      .sort((a,b) => a.y > b.y)
  }

  const keepAlive = (props) => {
     if (!this.hadSound && (props.x > 1.0)) {

       return Math.random > 1.0
     }

     return true
  }

  const BUZZARD_VELOCITY = 0.015
  const updateHPosition = (props) => {
    const {x=0, halt} = props

    const v = halt ? 0 : BUZZARD_VELOCITY

    return {
      ...props,
      halt: Math.random() < 0.1 ? !halt : halt,
      x: x > 1.1 ? -0.1 : x + v
    }
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
    const {wiflies, buzzards, mood, hunger, sleep, sad, asleep} = this.state
    if (sleep < 0.3) {
      this.setState('asleep', true)
    }
    if (wiflies.length > WIFLY_THERESHOLD) {
      this.setState('asleep', false)
      this.incState('mood', - wiflies.length * 0.002)
    }

    this.incState('mood', buzzards.length * 0.008)
    if (buzzards.length > 1) {
      this.setState('asleep', false)
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

  const createBuzzard = () => {
    this.state.buzzards.push({
      x: -0.0,
      y: 0.58 + Math.random()*0.1
    })
  }

  const updateBuzzards = () => {
    if (this.hadSound && this.state.buzzards.length < 5) {
      createBuzzard()
    }
    this.hadSound = false
  }

  this.init = () => {
    breedWiflies()
    setInterval(updateWiflies, 100)
    setInterval(updateMood, 1000)
    setInterval(updateBuzzards, 2000)
    updateWiflies()

    e.on('upgrade', () => {
      if (this.state.bedLevel < 3) {
        this.state.bedLevel++
      }
    })

    e.on('sound', () => {
      this.hadSound = true
    })
  }
}
