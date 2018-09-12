/* Handles drawing each element on the game */
function DrawService (e) {
  let tick = 0

  e.on('char:update', char => {
    this.char.state = char.asleep ? 'sleep'
      : char.eating ? 'eat'
      : char.sad ? 'sad'
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
        lu:    {u0: 0, v0:   0, u1: 1, v1: 1/7},
        ld:    {u0: 0, v0: 1/7, u1: 1, v1: 2/7},
        ru:    {u0: 0, v0:   0, u1: 1, v1: 1/7, f: 1},
        rd:    {u0: 0, v0: 1/7, u1: 1, v1: 2/7, f: 1},
        sad:   {u0: 0, v0: 2/7, u1: 1, v1: 3/7},
        eat1:  {u0: 0, v0: 3/7, u1: 1, v1: 4/7},
        eat2:  {u0: 0, v0: 4/7, u1: 1, v1: 5/7},
        eat3:  {u0: 0, v0: 5/7, u1: 1, v1: 6/7},
        sleep: {u0: 0, v0: 6/7, u1: 1, v1:   1},
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
        'smile':   {u0: 0, v0:   0, u1: 1, v1: 1/8},
        'laugh':   {u0: 0, v0: 1/8, u1: 1, v1: 2/8},
        'sad':     {u0: 0, v0: 2/8, u1: 1, v1: 3/8},
        'sleep':   {u0: 0, v0: 3/8, u1: 1, v1: 4/8},
        'buzzard': {u0: 0, v0: 4/8, u1: 1, v1: 5/8},
        'wifly':   {u0: 0, v0: 5/8, u1: 1, v1: 6/8},
        'heart':   {u0: 0, v0: 6/8, u1: 1, v1: 7/8},
        'food':    {u0: 0, v0: 7/8, u1: 1, v1:   1},
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
    const {
      u0=0,
      v0=0,
      u1=1,
      v1=1,
      offsetX=0,
      offsetY=0,
      f
    } = tiles[frame] || {}
    if (f) {
      canvas.trans(canvas.c.width, 0)
      canvas.scale(-1, 1)
    }
    canvas.img(
      obj.texture,
      obj.posX + offsetX,
      obj.posY + offsetY,
      obj.width, obj.height,
      u0, v0, u1, v1
    )
    if (f) {
      canvas.scale(-1, 1)
      canvas.trans(-canvas.c.width, 0)
    }
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
