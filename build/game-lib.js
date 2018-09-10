function Controls ({emit}) {
  const track = el => ev => {
    let speed = 0
    let interval
    let falling = false

    if (el) {
      const x = el.offsetParent.offsetLeft + 8*px
      const y = el.offsetParent.offsetTop + 8*px
      console.log('track')
      const touchMove = on(document.body, 'touchmove', ({changedTouches}) => {
        if (!el.offsetParent) {
          off(document.body, 'touchmove', touchMove)
          return
        }
        falling = false
        speed = 0
        const {clientY, clientX} = changedTouches[0]
        const left = Math.min(Math.max(0, clientX - x), el.offsetParent.clientWidth - 16*px)
        const top = Math.min(Math.max(0, clientY - y), el.offsetParent.clientHeight*0.6 - 16*px)
        el.style.top = `${Math.round(top / px) * px}px`
        el.style.left = `${Math.round(left / px) * px}px`
      })
      on(document.body, 'touchend', () => {
        // document.body.ontouchmove = null
        falling = true
      })
      interval = setInterval(() => {
        if (!el.offsetParent) {
          clearInterval(interval)
          return
        }
        const top = parseInt(el.style.top)
        if (falling && top < el.offsetParent.clientHeight*0.51) {
          speed++
          el.style.top = `${top + speed*px}px`
        }
      }, 50)
    }
  }

  const handleToy = (el, btn) => ev => {
    el.classList.remove('hidden')
    el.style.width = `${16*px}px`
    el.style.height = `${16*px}px`
    on(el, 'touchstart', track(el))
    emit('spend', btn.innerText)
    $ballBtn.setAttribute('disabled', true)
    $ballBtn.classList.add('disabled')
    $duckBtn.setAttribute('disabled', true)
    $duckBtn.classList.add('disabled')
    setTimeout(() => {
      $duckBtn.classList.remove('disabled')
      $ballBtn.classList.remove('disabled')
      el.classList.add('hidden')
    }, 10000)
  }

  const $ballBtn = __('#ball')
  const $ball = __('.ball-toy')
  click($ballBtn, handleToy($ball, $ballBtn))

  const $duckBtn = __('#duck')
  const $duck = __('.duck-toy')
  click($duckBtn, handleToy($duck, $duckBtn))

  click(__('#bed'), e => {
    emit('upgrade')
  })
  click(__('#feed'), e => {
    emit('consume')
  })
}

/* Handles drawing each element on the game */
function DrawService (e) {
  let tick = 0

  e.on('char:update', char => {
    this.char.state = char.asleep ? 'sleep'
      : char.sad ? 'sad'
      : char.eating ? 'eat'
      : 'idle'
    this.resetCharAnimation()
  })
  e.on('react', msg => {
    if (!this.queue.includes(msg)) {
      this.queue.push(msg.join('_'))
      setTimeout(() => {this.queue.shift()}, 4000)
    }
  })

  this.queue = []
  this.init = (canvas) => {
    window.px = canvas.c.width * 0.01


    this.char = {
      sprite: "char_green.png",
      width: 50 * px,
      height: 50 * px,
      posX: canvas.c.width * 0.25,
      posY: canvas.c.height * 0.5 - 25 * px,
      tiles: {
        lu:    {u0:   0, v0:   0, u1: 1/3, v1: 1/3},
        ld:    {u0: 1/3, v0:   0, u1: 2/3, v1: 1/3},
        ru:    {u0: 2/3, v0:   0, u1:   1, v1: 1/3},
        rd:    {u0:   0, v0: 1/3, u1: 1/3, v1: 2/3},
        sad:   {u0: 1/3, v0: 1/3, u1: 2/3, v1: 2/3},
        eat1:  {u0: 2/3, v0: 1/3, u1:   1, v1: 2/3},
        eat2:  {u0:   0, v0: 2/3, u1: 1/3, v1:   1},
        eat3:  {u0: 1/3, v0: 2/3, u1: 2/3, v1:   1},
        sleep: {u0: 2/3, v0: 2/3, u1:   1, v1:   1},
      },
      states: {
        idle: [
          'lu', 'ld', 'lu', 'ld',
          'ru', 'rd', 'ru', 'rd'
        ],
        sad: ['sad'],
        sleep: ['sleep'],
        eat: ['eat1', 'eat2', 'eat3',
              'eat2', 'eat3', 'eat2',
              'eat3', 'eat2', 'eat3',
              'eat3', 'eat2', 'eat3']
      }
    }
    this.icons = {
      sprite: "mood_icons.png",
      width: 10 * px,
      height: 10 * px,
      posX: 0,
      posY: canvas.c.height - 20*px,
      tiles: {
        hunger: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - 30*px,
          u0: 0, v0: 0, u1: 0.5, v1: 0.5
        },
        sleep: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - 20*px,
          u0: 0.5, v0: 0, u1: 1, v1: 0.5
        },
        mood: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - 10*px,
          u0: 0, v0: 0.5, u1: 0.5, v1: 1
        },
        hungerBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - 30*px,
          u0: 0.8, v0: 0.8, u1: 0.9, v1: 0.9
        },
        sleepBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - 20*px,
          u0: 0.8, v0: 0.9, u1: 0.9, v1: 1.0
        },
        moodBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - 10*px,
          u0: 0.90, v0: 0.8, u1: 1, v1: 0.9
        },
      }
    }
    this.wifly = {
      sprite: "wiflies.png",
      width: 16*px,
      height: 16*px,
      tiles: {
        0: {u0: 0.0, v0: 0.0, u1: 0.5, v1: 1/3},
        1: {u0: 0.5, v0: 0.0, u1: 1.0, v1: 1/3},
        2: {u0: 0.0, v0: 1/3, u1: 0.5, v1: 2/3},
        3: {u0: 0.5, v0: 1/3, u1: 1.0, v1: 2/3},
        dead0: {u0: 0.0, v0: 2/3, u1: 0.5, v1: 1.0},
        dead1: {u0: 0.5, v0: 2/3, u1: 1.0, v1: 1.0},
      },
      states: {
        flying: [0, 1, 2, 3],
        dead: ["dead0", "dead1"]
      }
    }
    this.buzzard = {
      sprite: "buzzard.png",
      width: 16*px,
      height: 16*px,
      tiles: {
        0: {u0:   0, v0:   0, u1:   1, v1: 1/2},
        1: {u0:   0, v0: 1/2, u1:   1, v1:   1},
        dead0: {u0: 0.0, v0: 2/3, u1: 0.5, v1: 1.0},
        dead1: {u0: 0.5, v0: 2/3, u1: 1.0, v1: 1.0},
      }
    }
    this.beds = {
      sprite: "beds.png",
      width: 64*px,
      height: 32*px,
      posX: canvas.c.width * 0.5 - 32*px,
      posY: canvas.c.height * 0.5 - 6*px,
      tiles: {
        bed1: {u0: 0, v0: 0.0, u1: 1, v1: 1/4},
        bed2: {u0: 0, v0: 1/4, u1: 1, v1: 2/4},
        bed3: {u0: 0, v0: 2/4, u1: 1, v1: 3/4},
        bed4: {u0: 0, v0: 3/4, u1: 1, v1: 4/4},
      }
    }
    this.bubble = {
      sprite: "bubble.png",
      width: 32*px,
      height: 32*px,
      posX: canvas.c.width - 32*px,
      posY: canvas.c.height*0.5 - 48*px
    }
    this.reactions = {
      sprite: "reactions.png",
      width: 10*px,
      height: 10*px,
      posX: canvas.c.width - 26*px,
      posY: canvas.c.height*0.5 - 40*px,
      tiles: {
        'smile':   {u0: 0, v0:   0, u1: 1, v1: 1/7},
        'laugh':   {u0: 0, v0: 1/7, u1: 1, v1: 2/7},
        'sad':     {u0: 0, v0: 2/7, u1: 1, v1: 3/7},
        'sleep':   {u0: 0, v0: 3/7, u1: 1, v1: 4/7},
        'buzzard': {u0: 0, v0: 4/7, u1: 1, v1: 5/7},
        'wifly':   {u0: 0, v0: 5/7, u1: 1, v1: 6/7},
        'heart':   {u0: 0, v0: 6/7, u1: 1, v1:   1}
      }
    }

    this.char.state = 'idle'
    this.resetCharAnimation = () => {
      this.char.nextFrame = 0
      if (this.charInterval) clearInterval(this.charInterval)
      this.charInterval = setInterval(() => {
        const {nextFrame, tiles, state, states} = this.char
        this.char.nextFrame = nextFrame + 1
        if (!tiles[states[state][nextFrame + 1]]) {
          this.char.nextFrame = 0
        }
      }, 500)
    }
    this.resetCharAnimation()

    setInterval(() => {
      tick++
    }, 50)

    return Promise.all([
      loadSprite(this.char, canvas),
      loadSprite(this.beds, canvas),
      loadSprite(this.icons, canvas),
      loadSprite(this.wifly, canvas),
      loadSprite(this.buzzard, canvas),
      loadSprite(this.bubble, canvas),
      loadSprite(this.reactions, canvas),
    ])
  }

  const loadSprite = (obj, canvas) => {
    return new Promise((resolve, reject) => {
      const texture = new Image()
      texture.src = obj.sprite
      texture.onload = () => {
        obj.texture = TCTex(
          canvas.g,
          texture,
          texture.width,
          texture.height
        )
        resolve()
      }
    })
  }

  this.draw = (c, s) => {
    if (!c) return

    c.cls()
    c.push()
    c.trans(0, 0)

    this.drawWiflies(c, s.wiflies)
    this.drawWiflies(c, s.deadWiflies, true)

    const {tiles, state, states, nextFrame} = this.char
    this.drawBed(c, s.bedLevel)

    renderObject(c, this.char, states[state][nextFrame])
    if (this.queue.length > 0) {
      const bob = (Math.ceil(tick/6)%2)*px
      const [frameA, frameB] = this.queue[0].split('_')
      c.trans(0, bob)
      renderObject(c, this.bubble)
      renderObject(c, this.reactions, frameA)
      c.trans(10*px, 0)
      renderObject(c, this.reactions, frameB)
      c.trans(-10*px, 0)
      c.trans(0, -bob)
    }

    this.drawMoodBars(c, s)
    this.drawBuzzards(c, s.buzzards)

    c.pop()
    c.flush()
  }

  const renderObject = (canvas, obj, frame='') => {
    const {tiles={}} = obj
    if (obj.tiles && !tiles[frame]) {
      console.error(`Frame ${frame} doesn't exit`);
    }
    const {u0=0, v0=0, u1=1, v1=1, offsetX=0, offsetY=0} = tiles[frame] || {}
    canvas.img(
        obj.texture,
        obj.posX + offsetX,
        obj.posY + offsetY,
        obj.width, obj.height,
        u0, v0, u1, v1
    );
  }

  this.drawMoodBars = (canvas, moodState) => {
    renderObject(canvas, this.icons, "hunger")
    renderObject(canvas, this.icons, "sleep")
    renderObject(canvas, this.icons, "mood")

    renderObject(canvas, {
      ...this.icons,
      width: canvas.c.width * 0.7 * moodState.hunger
    }, "hungerBar")
    renderObject(canvas, {
      ...this.icons,
      width: canvas.c.width * 0.7 * moodState.sleep
    }, "sleepBar")
    renderObject(canvas, {
      ...this.icons,
      width: canvas.c.width * 0.7 * moodState.mood
    }, "moodBar")
  }

  this.drawWiflies = (canvas, wiflies, areDead) => {
    wiflies.forEach(({x, y}, i) => {
      const frame = areDead ? `dead${tick%2}` : (i + tick)%4
      renderObject(canvas, {
        ...this.wifly,
        posX: x * canvas.c.width,
        posY: y * canvas.c.height * 0.4
      }, frame)
    })
  }

  this.drawBuzzards = (canvas, buzzards) => {
    buzzards.forEach(({x=0, y=0, halt, mirror}, i) => {
      if (mirror) {
        canvas.trans(canvas.c.width, 0)
        canvas.scale(-1, 1)
      }

      const frame = halt ? 0 : tick%2
      renderObject(canvas, {
        ...this.buzzard,
        posX: x * canvas.c.width,
        posY: y * canvas.c.height
      }, frame)

      if (mirror) {
        canvas.scale(-1, 1)
        canvas.trans(-canvas.c.width, 0)
      }
    })
  }

  this.drawBed = (canvas, bedLevel = 0) => {
    if (bedLevel > 0) {
      renderObject(canvas, this.beds, `bed${bedLevel}`)
    }
  }
}

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
    eating: false,
    bedLevel: 0,
    money: 220
  }

  window.getState = () => {
    return this.state;
  }
  window.getProps = () => {
    return this.hadSound;
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

  const breedWiflies = () => {
    const {wiflies, deadWiflies} = this.state

    if (navigator.onLine && wiflies.length < 15) {
      createWifly()
    }

    if ((!navigator.onLine || Math.random() > 0.7) && wiflies.length > 0) {
      killWifly()
    }
    setTimeout(breedWiflies, 5000 * Math.random() + 5000)
  }

  const updateCreatures = () => {
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

  const WIFLY_THERESHOLD = 3
  const MINIMUM_BAR_SIZE = 0.01
  const MOOD_SPEED = 0.002
  const SLEEP_SPEED = 0.002
  const HUNGER_SPEED = 0.005
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
    } = this.state

    if (sleep < 0.5) {
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

    if (buzzards.length > 2) {
      if (asleep) {
        e.emit('react', ['buzzard', 'sleep'])
      } else {
        e.emit('react', ['buzzard', 'smile'])
      }
      this.setState('asleep', false)
    }

    if ((!asleep && sleep < 0.2) || mood < 0.2 || hunger < 0.2) {
        this.setState('sad', true)
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
      : eating ? HUNGER_SPEED * 10
      : -HUNGER_SPEED)

    if (!sad) {
      e.emit('earn')
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
    if (money > this.state.bedLevel * 100) __('#bed').removeAttribute('disabled')
    else __('#bed').setAttribute('disabled', true)
  }

  this.init = () => {
    breedWiflies()
    setInterval(updateCreatures, 100)
    setInterval(updateMood, 1000)
    setInterval(updateBuzzards, 2000)
    updateCreatures()

    e.on('upgrade', () => {
      if (this.state.bedLevel < 4) {
        this.state.money -= this.state.bedLevel * 100
        this.state.bedLevel++
        __('#bed span').innerText = `-${this.state.bedLevel * 100}`
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
        console.log(sleeping, eating, deadWiflies.length);
      }
    })

    e.on('spend', amount => {
      this.state.money -= Math.abs(amount)
    })
  }
}

function Microphone () {
  let audioCtx
  let analyser
  let bufferLength
  let dataArray
  let valueAccumulator
  let valueCount
  let level = 0
  let average = 0

  const init = () => {
    audioCtx = new window.AudioContext()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    navigator.mediaDevices
    .getUserMedia ({audio: true})
    .then(stream => {
      audioCtx.createMediaStreamSource(stream).connect(analyser)
      analyse()
      setInterval(collectValues, 500)
    })
  }

  const analyse = () => {
    analyser.getByteTimeDomainData(dataArray)
    for(var i = 0; i < bufferLength; i++) {
      dataPoint = dataArray[i] - 128
      valueAccumulator += dataPoint**2
      valueCount++
    }
    requestAnimationFrame(analyse)
  }

  const collectValues = () => {
    level = Math.round(valueAccumulator / valueCount) || 0
    valueAccumulator = 0
    valueCount = 0
    highest = 0
    average = Math.round((average * 0.5) + level * 0.5)
    if (average < 100) {
      __('#meter').style.width = `${level}%`
    } else {
      __('#meter').style.width = `${Math.min(100, (100*level)/(1.5*average))}%`
    }
  }

  this.getLevel = () => {
    return level
  }

  this.hadSoundSpike = () => level > 1.5 * average

  init()
}

// https://github.com/allouis/minivents
function Events(target) {
  var events = {}, empty = [];
  target = target || this
  /**
   *  On: listen to events
   */
  target.on = function(type, func, ctx){
    (events[type] = events[type] || []).push([func, ctx])
    return target
  }
  /**
   *  Off: stop listening to event / specific callback
   */
  target.off = function(type, func){
    type || (events = {})
    var list = events[type] || empty,
        i = list.length = func ? list.length : 0;
    while(i--) func == list[i][0] && list.splice(i,1)
    return target
  }
  /**
   * Emit: send event, callbacks will be triggered
   */
  target.emit = function(type){
    var e = events[type] || empty, list = e.length > 0 ? e.slice(0, e.length) : e, i=0, j;
    while(j=list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1))
    return target
  };
};

/*
 * TinyCanvas module (https://github.com/bitnenfer/tiny-canvas)
 * Developed by Felipe Alfonso -> https://twitter.com/bitnenfer/
 */
(function () {

  function CompileShader(gl, source, type) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
  }

  function CreateShaderProgram(gl, vsSource, fsSource) {
      var program = gl.createProgram(),
          vShader = CompileShader(gl, vsSource, 35633),
          fShader = CompileShader(gl, fsSource, 35632);
      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.linkProgram(program);
      return program;
  }

  function CreateBuffer(gl, bufferType, size, usage) {
      var buffer = gl.createBuffer();
      gl.bindBuffer(bufferType, buffer);
      gl.bufferData(bufferType, size, usage);
      return buffer;
  }

  function CreateTexture(gl, image, width, height) {
      var texture = gl.createTexture();
      gl.bindTexture(3553, texture);
      gl.texParameteri(3553, 10242, 33071);
      gl.texParameteri(3553, 10243, 33071);
      gl.texParameteri(3553, 10240, 9728);
      gl.texParameteri(3553, 10241, 9728);
      gl.texImage2D(3553, 0, 6408, 6408, 5121, image);
      gl.bindTexture(3553, null);
      texture.width = width;
      texture.height = height;
      return texture;
  }
  window['TCShd'] = CompileShader;
  window['TCPrg'] = CreateShaderProgram;
  window['TCBuf'] = CreateBuffer;
  window['TCTex'] = CreateTexture;

  function TinyCanvas(canvas) {
      var gl = canvas.getContext('webgl'),
          VERTEX_SIZE = (4 * 2) + (4 * 2) + (4),
          MAX_BATCH = 10922, // floor((2 ^ 16) / 6)
          MAX_STACK = 100,
          MAT_SIZE = 6,
          VERTICES_PER_QUAD = 6,
          MAT_STACK_SIZE = MAX_STACK * MAT_SIZE,
          VERTEX_DATA_SIZE = VERTEX_SIZE * MAX_BATCH * 4,
          INDEX_DATA_SIZE = MAX_BATCH * (2 * VERTICES_PER_QUAD),
          width = canvas.width,
          height = canvas.height,
          shader = CreateShaderProgram(
              gl, [
                  'precision lowp float;',
                  // IN Vertex Position and
                  // IN Texture Coordinates
                  'attribute vec2 a, b;',
                  // IN Vertex Color
                  'attribute vec4 c;',
                  // OUT Texture Coordinates
                  'varying vec2 d;',
                  // OUT Vertex Color
                  'varying vec4 e;',
                  // CONST View Matrix
                  'uniform mat4 m;',
                  'uniform vec2 r;',
                  'void main(){',
                  'gl_Position=m*vec4(a,1.0,1.0);',
                  'd=b;',
                  'e=c;',
                  '}'
              ].join('\n'), [
                  'precision lowp float;',
                  // OUT Texture Coordinates
                  'varying vec2 d;',
                  // OUT Vertex Color
                  'varying vec4 e;',
                  // CONST Single Sampler2D
                  'uniform sampler2D f;',
                  'void main(){',
                  'gl_FragColor=texture2D(f,d)*e;',
                  '}'
              ].join('\n')
          ),
          glBufferSubData = gl.bufferSubData.bind(gl),
          glDrawElements = gl.drawElements.bind(gl),
          glBindTexture = gl.bindTexture.bind(gl),
          glClear = gl.clear.bind(gl),
          glClearColor = gl.clearColor.bind(gl),
          vertexData = new ArrayBuffer(VERTEX_DATA_SIZE),
          vPositionData = new Float32Array(vertexData),
          vColorData = new Uint32Array(vertexData),
          vIndexData = new Uint16Array(INDEX_DATA_SIZE),
          IBO = CreateBuffer(gl, 34963, vIndexData.byteLength, 35044),
          VBO = CreateBuffer(gl, 34962, vertexData.byteLength, 35048),
          count = 0,
          mat = new Float32Array([1, 0, 0, 1, 0, 0]),
          stack = new Float32Array(100),
          stackp = 0,
          cos = Math.cos,
          sin = Math.sin,
          currentTexture = null,
          renderer = null,
          locA, locB, locC;

      gl.blendFunc(770, 771);
      gl.enable(3042);
      gl.useProgram(shader);
      gl.bindBuffer(34963, IBO);
      for (var indexA = indexB = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4)
          vIndexData[indexA + 0] = indexB,
          vIndexData[indexA + 1] = indexB + 1,
          vIndexData[indexA + 2] = indexB + 2,
          vIndexData[indexA + 3] = indexB + 0,
          vIndexData[indexA + 4] = indexB + 3,
          vIndexData[indexA + 5] = indexB + 1;

      glBufferSubData(34963, 0, vIndexData);
      gl.bindBuffer(34962, VBO);
      locA = gl.getAttribLocation(shader, 'a');
      locB = gl.getAttribLocation(shader, 'b');
      locC = gl.getAttribLocation(shader, 'c');
      gl.enableVertexAttribArray(locA);
      gl.vertexAttribPointer(locA, 2, 5126, 0, VERTEX_SIZE, 0);
      gl.enableVertexAttribArray(locB);
      gl.vertexAttribPointer(locB, 2, 5126, 0, VERTEX_SIZE, 8);
      gl.enableVertexAttribArray(locC);
      gl.vertexAttribPointer(locC, 4, 5121, 1, VERTEX_SIZE, 16);
      gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'm'), 0,
          new Float32Array([
              2 / width, 0, 0, 0,
              0, -2 / height, 0, 0,
              0, 0, 1, 1, -1, 1, 0, 0
          ])
      );
      gl.activeTexture(33984);
      renderer = {
          'g': gl,
          'c': canvas,
          'col': 0xFFFFFFFF,
          'bkg': function (r, g, b) {
              glClearColor(r, g, b, 1);
          },
          'cls': function () {
              glClear(16384);
          },
          'trans': function (x, y) {
              mat[4] = mat[0] * x + mat[2] * y + mat[4];
              mat[5] = mat[1] * x + mat[3] * y + mat[5];
          },
          'scale': function (x, y) {
              mat[0] = mat[0] * x;
              mat[1] = mat[1] * x;
              mat[2] = mat[2] * y;
              mat[3] = mat[3] * y;
          },
          'rot': function (r) {
              var a = mat[0],
                  b = mat[1],
                  c = mat[2],
                  d = mat[3],
                  sr = sin(r),
                  cr = cos(r);

              mat[0] = a * cr + c * sr;
              mat[1] = b * cr + d * sr;
              mat[2] = a * -sr + c * cr;
              mat[3] = b * -sr + d * cr;
          },
          'push': function () {
              stack[stackp + 0] = mat[0];
              stack[stackp + 1] = mat[1];
              stack[stackp + 2] = mat[2];
              stack[stackp + 3] = mat[3];
              stack[stackp + 4] = mat[4];
              stack[stackp + 5] = mat[5];
              stackp += 6;
          },
          'pop': function () {
              stackp -= 6;
              mat[0] = stack[stackp + 0];
              mat[1] = stack[stackp + 1];
              mat[2] = stack[stackp + 2];
              mat[3] = stack[stackp + 3];
              mat[4] = stack[stackp + 4];
              mat[5] = stack[stackp + 5];
          },
          'img': function (texture, x, y, w, h, u0, v0, u1, v1) {
              var x0 = x,
                  y0 = y,
                  x1 = x + w,
                  y1 = y + h,
                  x2 = x,
                  y2 = y + h,
                  x3 = x + w,
                  y3 = y,
                  a = mat[0],
                  b = mat[1],
                  c = mat[2],
                  d = mat[3],
                  e = mat[4],
                  f = mat[5],
                  offset = 0,
                  argb = renderer['col'];

              if (texture != currentTexture ||
                  count + 1 >= MAX_BATCH) {
                  glBufferSubData(34962, 0, vertexData);
                  glDrawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
                  count = 0;
                  if (currentTexture != texture) {
                      currentTexture = texture;
                      glBindTexture(3553, currentTexture);
                  }
              }

              offset = count * VERTEX_SIZE;
              // Vertex Order
              // Vertex Position | UV | ARGB
              // Vertex 1
              vPositionData[offset++] = x0 * a + y0 * c + e;
              vPositionData[offset++] = x0 * b + y0 * d + f;
              vPositionData[offset++] = u0;
              vPositionData[offset++] = v0;
              vColorData[offset++] = argb;

              // Vertex 2
              vPositionData[offset++] = x1 * a + y1 * c + e;
              vPositionData[offset++] = x1 * b + y1 * d + f;
              vPositionData[offset++] = u1;
              vPositionData[offset++] = v1;
              vColorData[offset++] = argb;

              // Vertex 3
              vPositionData[offset++] = x2 * a + y2 * c + e;
              vPositionData[offset++] = x2 * b + y2 * d + f;
              vPositionData[offset++] = u0;
              vPositionData[offset++] = v1;
              vColorData[offset++] = argb;

              // Vertex 4
              vPositionData[offset++] = x3 * a + y3 * c + e;
              vPositionData[offset++] = x3 * b + y3 * d + f;
              vPositionData[offset++] = u1;
              vPositionData[offset++] = v0;
              vColorData[offset++] = argb;

              if (++count >= MAX_BATCH) {
                  glBufferSubData(34962, 0, vertexData);
                  glDrawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
                  count = 0;
              }
          },
          'flush': function () {
              if (count == 0) return;
              glBufferSubData(34962, 0, vPositionData.subarray(0, count * VERTEX_SIZE));
              glDrawElements(4, count * VERTICES_PER_QUAD, 5123, 0);
              count = 0;
          }
      };
      return renderer;
  }
  window['TC'] = TinyCanvas;
})();

window.__ = (q) => document.querySelector(q)
window.on = (el, ev, c) => el.addEventListener(ev,c)
window.off = (el, type, ev) => el.removeEventListener(type, ev)
window.click = (el,c) => on(el, 'click',c)
