/* Handles drawing each element on the game */
function DrawService () {
  this.init = (canvas) => {
    this.character = {
      texture: null,
      width: canvas.c.width * 0.5,
      height: canvas.c.width * 0.5,
      u0: 0.5,
      v0: 0.5,
      u1: 1,
      v1: 1,
    }

    return new Promise((resolve, reject) => {
      this.characterImage = new Image()
      this.characterImage.src = "char_red.png"
      this.characterImage.onload = () => {
        this.character.texture = TCTex(
          canvas.g,
          this.characterImage,
          this.characterImage.width,
          this.characterImage.height
        )
        console.log(canvas);
        resolve(canvas)
      }
    });
  }

  this.draw = (canvas) => {
    if (!canvas) return

    canvas.cls();
    canvas.push();
    canvas.trans(0, 0);
    canvas.img(
        this.character.texture,
        canvas.c.width * 0.5 - this.character.width * 0.5,
        canvas.c.height * 0.5 - this.character.height * 0.5,
        this.character.width,
        this.character.height,
        this.character.u0,
        this.character.v0,
        this.character.u1,
        this.character.v1
    );
    canvas.pop();
    canvas.flush();
  }
}
