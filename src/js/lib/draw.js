/* Handles drawing each element on the game */
function DrawService () {
  this.init = (canvas) => {
    this.character = {
      sprite: "char_red.png",
      width: canvas.c.width * 0.5,
      height: canvas.c.width * 0.5,
      posX: canvas.c.width * 0.25,
      posY: canvas.c.height * 0.5 - canvas.c.width * 0.25,
      tiles: {
        idle: {u0: 0.5, v0: 0.5, u1: 1, v1: 1}
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
          u0: 0.5, v0: 0.5, u1: 1, v1: 0.625
        },
        sleepBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.20,
          u0: 0.5, v0: 0.625, u1: 1, v1: 0.75
        },
        moodBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.10,
          u0: 0.5, v0: 0.75, u1: 1, v1: 0.875
        },
      }
    }

    return Promise.all([
      loadSprite(this.character, canvas),
      loadSprite(this.icons, canvas),
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
    renderObject(canvas, this.character, "idle")
    renderObject(canvas, this.icons, "hunger")
    renderObject(canvas, this.icons, "sleep")
    renderObject(canvas, this.icons, "mood")
    canvas.pop()
    canvas.flush()
  }

  const renderObject = (canvas, obj, frame) => {
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
}
