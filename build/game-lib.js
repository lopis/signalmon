/* Handles drawing each element on the game */
function DrawService () {
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

    this.char.state = 'idle'
    this.char.nextFrame = 0
    setInterval(() => {
      const {nextFrame, tiles, state, states} = this.char
      this.char.nextFrame = nextFrame + 1
      if (!tiles[states[state][nextFrame + 1]]) {
        this.char.nextFrame = 0
      }
    }, 500)

    return Promise.all([
      loadSprite(this.char, canvas),
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

    const {tiles, state, states, nextFrame} = this.char
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
}


function Microphone () {
  let audioCtx
  let analyser
  let bufferLength
  let dataArray
  let valueAccumulator
  let valueCount
  let level = 0

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
      setInterval(collectValues, 1500)
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
    level = Math.round(valueAccumulator / valueCount)
    valueAccumulator = 0
    valueCount = 0
    highest = 0
  }

  this.getLevel = () => {
    return level
  }

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
