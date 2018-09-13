function Game (e) {
  this.state = {
    hunger: 1.0,
    sleep: 1.0,
    mood: 1.0,
    moodBuffer: 0.0,
    buzzards: [],
    wiflies: [],
    deadWiflies: [],
    asleep: false,
    hungry: false,
    sad: false,
    eating: false,
    bedLevel: 0,
    money: 0
  }

  window.getState = () => {
    return this.state;
  }
  window.getProps = () => {
    return this.hadSound;
  }

  const getBedCost = () => {
    return this.state.bedLevel === 0
      ? 0
      : this.state.bedLevel * 100 + 99
  }

  const createWifly = () => {
    this.state.wiflies.push({
      x: Math.random() * 0.8 + 0.1,
      y: Math.random() * 0.2 + 0.1
    })
  }

  const updateDeadCount = () => {
    const count = this.state.deadWiflies.length

    __('#food span').innerText = count
    if (count < 1) {
      __('#feed').setAttribute('disabled', true)
    } else {
      __('#feed').removeAttribute('disabled')
    }
  }

  const killWifly = () => {
    const dead = this.state.wiflies.shift()
    dead.isDead = true
    dead.pos = 1.1 + ((dead.x - 0.5)**2)
    this.state.deadWiflies.push(dead)
    updateDeadCount()
  }

  let breedTimeout
  const breedWiflies = () => {
    const {wiflies, deadWiflies} = this.state

    if (navigator.onLine && wiflies.length < 15) {
      createWifly()
    }

    if ((!navigator.onLine || Math.random() > 0.7) && wiflies.length > 0) {
      killWifly()
    }
    const timeout = Math.ceil(
      navigator.onLine
      ? 20000 * Math.random()
      : 2000 * Math.random()
    )
    breedTimeout = setTimeout(
      breedWiflies,
      timeout
    )
  }

  const updateCreatures = () => {
    const {wiflies, deadWiflies, buzzards} = this.state

    this.state.wiflies = wiflies.map(updatePosition)
    this.state.deadWiflies = deadWiflies.map(updatePosition)
    this.state.buzzards = buzzards.map(updateHPosition)
      .filter(keepAlive)
      .sort((a,b) => a.y > b.y)

    if (navigator.onLine) {
      __('#signal #meter').style.height = '100%'
    } else {
      __('#signal #meter').style.height = '5%'
    }
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

  const WIFLY_THERESHOLD = 3
  const MINIMUM_BAR_SIZE = 0.01
  const MOOD_SPEED = 0.003
  const SLEEP_SPEED = 0.006
  const HUNGER_SPEED = 0.008
  const updateMood = () => {
    const {
      asleep,
      buzzards,
      eating,
      hunger,
      mood,
      sad,
      sleep,
      wiflies,
      moodBuffer,
    } = this.state

    if (sleep < 0.5 && !eating) {
      this.setState('asleep', true)
    }

    let moodInc = 0
    if (wiflies.length > WIFLY_THERESHOLD) {
      if (asleep) {
        this.setState('asleep', false)
        e.emit('react', ['wifly', 'sleep'])
      } else {
        e.emit('react', ['wifly', 'sad'])
      }
      moodInc -= wiflies.length - WIFLY_THERESHOLD
      moodInc = moodInc * MOOD_SPEED
      moodInc = moodInc / (1 + this.state.bedLevel)
      this.incState('mood', moodInc)
    }
    this.incState(
      'mood',
      buzzards.length * MOOD_SPEED
    )
    if (moodBuffer) {
      e.emit('react', ['laugh', 'heart'])
      this.incState('mood', moodBuffer)
      this.state.moodBuffer = 0
    }

    if (buzzards.length > 2 && asleep) {
      e.emit('react', ['buzzard', 'sleep'])
      this.setState('asleep', false)
    } else if (buzzards.length > 0) {
      e.emit('react', ['buzzard', 'smile'])
    }

    if ((!asleep && sleep < 0.2) || mood < 0.2 || hunger < 0.2) {
        this.setState('sad', true)
    } else {
      this.setState('sad', false)
    }
    this.incState('sleep',
      asleep ?
      SLEEP_SPEED * (3 + this.state.bedLevel) :
      -SLEEP_SPEED
    )
    if (asleep && sleep === 1) {
      this.setState('asleep', false)
      this.setState('sad', false)
    }
    this.incState('hunger',
      asleep ? -HUNGER_SPEED * 0.3
      : eating ? HUNGER_SPEED * 20
      : -HUNGER_SPEED)

    if (hunger < 0.3) {
      e.emit('react', ['food', 'sad'])
    }
    if (!sad) {
      e.emit('earn')
    }
    if (mood > 0.75) {
      e.emit('earn')
    }
    if (mood > 0.95) {
      e.emit('earn')
    }

    if (hunger === MINIMUM_BAR_SIZE) {
      e.emit('die', 'You let it starve.')
    } else if (mood === MINIMUM_BAR_SIZE) {
      e.emit('die', 'You bored it to death.')
    } else if (sleep === MINIMUM_BAR_SIZE) {
      e.emit('die', 'Now it\'l sleep forever.')
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
      y: 0.55 + Math.random()*0.07,
      mirror: Math.random() > 0.5
    })
  }

  const updateBuzzards = () => {
    if (this.hadSound && this.state.buzzards.length < 5) {
      createBuzzard()
    }
    this.hadSound = false
  }

  const updateMoney = () => {
    __('#money span').innerText = `${this.state.money}€`

    const money = this.state.money
    if (money > 50) __('#ball').removeAttribute('disabled')
    else __('#ball').setAttribute('disabled', true)

    if (money > 75) __('#duck').removeAttribute('disabled')
    else __('#duck').setAttribute('disabled', true)

    if (this.state.bedLevel > 3) {
      __('#bed').setAttribute('disabled', true)
      __('#bed').className = 'disabled'
    }
    if (money > getBedCost()) __('#bed').removeAttribute('disabled')
    else __('#bed').setAttribute('disabled', true)
  }

  this.init = () => {
    breedWiflies()
    this.intervals = [
      setInterval(updateCreatures, 100),
      setInterval(updateMood, 1000),
      setInterval(updateBuzzards, 2000)
    ]
    updateCreatures()

    e.on('die', msg => {
      this.intervals.map(clearInterval)
      clearTimeout(breedTimeout)
      __('body').className = 'dead'
      __('body').setAttribute(
        'data-dead-text',
        `${msg} Score: ${this.state.money}`
      )
      e.emit('char:update', {asleep:true})
    })

    e.on('upgrade', () => {
      if (this.state.bedLevel < 4) {
        this.state.money -= getBedCost()
        this.state.bedLevel++
        __('#bed span').innerText = `-${getBedCost()}`
        updateMoney()
      }
    })

    e.on('sound', () => {
      this.hadSound = true
    })

    e.on('earn', () => {
      this.state.money++
      updateMoney()
    })

    e.on('consume', () => {
      const {deadWiflies, eating, sleeping} = this.state

      if (!sleeping && !eating && deadWiflies.length >= 1) {
        const mealCount = Math.max(Math.min(deadWiflies.length, 5), 1)
        this.setState('deadWiflies', deadWiflies.splice(mealCount))
        this.setState('eating', true)
        updateDeadCount()
        setTimeout(() => {
          this.setState('eating', false)
        }, mealCount * 1000)
      } else {
      }
    })

    e.on('spend', amount => {
      this.state.money -= Math.abs(amount)
    })

    e.on('play', () => {
      this.state.moodBuffer += MOOD_SPEED
    })
  }
}
