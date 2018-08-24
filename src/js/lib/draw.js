/* Handles drawing each element on the game */
function DrawService () {
  this.init = (canvas) => {
    this.character = {
      sprite: "char_red.png",
      width: canvas.c.width * 0.5,
      height: canvas.c.width * 0.5,
      posX: canvas.c.width * 0.5,
      posY: canvas.c.height * 0.5,
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
        }
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

  this.draw = (canvas) => {
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
    console.log(obj.posX, obj.width * 0.5, offsetX, offsetY);
    canvas.img(
        obj.texture,
        obj.posX - obj.width * 0.5 + offsetX,
        obj.posY - obj.height * 0.5 + offsetY,
        obj.width, obj.height,
        u0, v0, u1, v1
    );
  }
}
