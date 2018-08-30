/* Handles drawing each element on the game */
function DrawService () {
  let tick = 0
  this.init = (canvas) => {
    this.char = {
      sprite: "char_red.png",
      width: canvas.c.width * 0.5,
      height: canvas.c.width * 0.5,
      posX: canvas.c.width * 0.25,
      posY: canvas.c.height * 0.5 - canvas.c.width * 0.25,
      tiles: {
        idle0: {u0: 0.0, v0: 0.0, u1: 0.5, v1: 0.5},
        idle1: {u0: 0.5, v0: 0.0, u1: 1.0, v1: 0.5},
        idle2: {u0: 0.0, v0: 0.5, u1: 0.5, v1: 1.0},
        idle3: {u0: 0.5, v0: 0.5, u1: 1.0, v1: 1.0},
      },
      states: {
        idle: [
          'idle0', 'idle1', 'idle0', 'idle1',
          'idle2', 'idle3', 'idle2', 'idle3'
        ]
      }
    }
    this.icons = {
      sprite: "mood_icons.png",
      width: canvas.c.width * 0.05,
      height: canvas.c.width * 0.05,
      posX: 0,
      posY: canvas.c.height,
      tiles: {
        hunger: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - canvas.c.width * 0.30,
          u0: 0, v0: 0, u1: 0.5, v1: 0.5
        },
        sleep: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - canvas.c.width * 0.20,
          u0: 0.5, v0: 0, u1: 1, v1: 0.5
        },
        mood: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - canvas.c.width * 0.10,
          u0: 0, v0: 0.5, u1: 0.5, v1: 1
        },
        hungerBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.30,
          u0: 0.8, v0: 0.8, u1: 0.9, v1: 0.9
        },
        sleepBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.20,
          u0: 0.8, v0: 0.9, u1: 0.9, v1: 1.0
        },
        moodBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.10,
          u0: 0.9, v0: 0.8, u1: 1, v1: 0.9
        },
      }
    }
    this.wifly = {
      sprite: "wiflies.png",
      width: canvas.c.width * 0.1,
      height: canvas.c.width * 0.1,
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
    this.items = {
      sprite: "items.png",
      width: canvas.c.width * 0.125,
      height: canvas.c.width * 0.125,
      posX: canvas.c.width * 0.25,
      posY: canvas.c.height * 0.5 - canvas.c.width * 0.25,
      tiles: {
        ball: {u0: 0.0, v0: 0.0, u1: 1/4, v1: 1/4},
        duck: {u0: 0.0, v0: 1/4, u1: 1/4, v1: 2/4},
        bed1: {u0: 1/4, v0: 0.0, u1: 4/4, v1: 1/4},
        bed2: {u0: 1/4, v0: 1/4, u1: 4/4, v1: 2/4},
        bed3: {u0: 1/4, v0: 2/4, u1: 4/4, v1: 3/4},
      }
    }

    this.char.state = 'idle'
    this.char.nextFrame = 0
    setInterval(() => {
      const {nextFrame, tiles, state, states} = this.char
      this.char.nextFrame = nextFrame + 1
      if (!tiles[states[state][nextFrame + 1]]) {
        this.char.nextFrame = 0
      }
    }, 500)

    setInterval(() => {
      tick++
    }, 50)

    return Promise.all([
      loadSprite(this.char, canvas),
      loadSprite(this.items, canvas),
      loadSprite(this.icons, canvas),
      loadSprite(this.wifly, canvas),
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

  this.draw = canvas => {
    if (!canvas) return

    canvas.cls()
    canvas.push()
    canvas.trans(0, 0)

    const {tiles, state, states, nextFrame} = this.char
    this.drawBed(canvas, 1)
    renderObject(canvas, this.char, states[state][nextFrame])

    renderObject(canvas, this.icons, "hunger")
    renderObject(canvas, this.icons, "sleep")
    renderObject(canvas, this.icons, "mood")
    canvas.pop()
    canvas.flush()
  }

  const renderObject = (canvas, obj, frame) => {
    if (!obj.tiles[frame]) {
      console.error(`Frame ${frame} doesn't exit`);
      throw `Frame ${frame} doesn't exit`
    }
    const {u0, v0, u1, v1, offsetX = 0, offsetY = 0} = obj.tiles[frame]
    canvas.img(
        obj.texture,
        obj.posX + offsetX,
        obj.posY + offsetY,
        obj.width, obj.height,
        u0, v0, u1, v1
    );
  }

  this.drawMoodBars = (canvas, moodState) => {
    canvas.push()
    canvas.trans(0, 0)
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
    canvas.pop()
    canvas.flush()
  }

  this.drawWiflies = (canvas, wiflies, areDead) => {
    canvas.push()
    canvas.trans(0, 0)
    wiflies.forEach(({x, y}, i) => {
      const frame = areDead ? `dead${tick%2}` : (i + tick)%4
      renderObject(canvas, {
        ...this.wifly,
        posX: x * canvas.c.width,
        posY: y * canvas.c.height * 0.4
      }, frame)
    })
    canvas.pop()
    canvas.flush()
  }

  this.drawBed = (canvas, bedLevel = 0) => {
    if (bedLevel > 0) {
      renderObject(canvas, {
        ...this.items,
        width: canvas.c.width * 0.75,
        height: canvas.c.width * 0.25,
        posX: canvas.c.width * 0.125,
        posY: canvas.c.height * 0.5 - canvas.c.width * 0.0625,
      }, `bed${bedLevel}`)
    }
  }
}
