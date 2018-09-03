function Controls ({emit}) {
  const track = el => ev => {
    if (!el) {
      document.body.onmousemove = null
    } else {
      const x = el.offsetParent.offsetLeft + 32
      const y = el.offsetParent.offsetTop + 32
      document.body.onmousemove = ({clientX, clientY}) => {
        el.style.top = `${clientY - y}px`
        el.style.left = `${clientX - x}px`
      }
      on(document.body, 'mouseup', track(null))
      on(document.body, 'mouseleave', track(null))
    }
  }

  click(__('#ball'), e => {
    console.log('#ball')
  })
  click(__('#duck'), e => {
    __('#duck').setAttribute('disabled', true)
    const duck = document.createElement('div')
    duck.className = 'duck-toy'
    on(duck, 'mousedown', track(duck))
    __('#app').appendChild(duck)
  })
  click(__('#bed'), e => {
    emit('upgrade')
  })
  click(__('#feed'), e => {
    console.log('#feed')
  })
}

/* Handles drawing each element on the game */
function DrawService (e) {
  let tick = 0

  e.on('char:update', char => {
    console.log('char:update');
    this.char.state = char.asleep ? 'sleep'
      : char.sad ? 'sad'
      : 'idle'
    this.char.nextFrame = 0
  })

  this.init = (canvas) => {
    this.char = {
      sprite: "char_green.png",
      width: canvas.c.width * 0.5,
      height: canvas.c.width * 0.5,
      posX: canvas.c.width * 0.25,
      posY: canvas.c.height * 0.5 - canvas.c.width * 0.25,
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
              'eat2', 'eat3', 'eat2']
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
          offsetY: - canvas.c.width * 0.45,
          u0: 0, v0: 0, u1: 0.5, v1: 0.5
        },
        sleep: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - canvas.c.width * 0.35,
          u0: 0.5, v0: 0, u1: 1, v1: 0.5
        },
        mood: {
          offsetX: canvas.c.width * 0.10,
          offsetY: - canvas.c.width * 0.25,
          u0: 0, v0: 0.5, u1: 0.5, v1: 1
        },
        hungerBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.45,
          u0: 0.8, v0: 0.8, u1: 0.9, v1: 0.9
        },
        sleepBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.35,
          u0: 0.8, v0: 0.9, u1: 0.9, v1: 1.0
        },
        moodBar: {
          offsetX: canvas.c.width * 0.20,
          offsetY: - canvas.c.width * 0.25,
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
    this.buzzard = {
      sprite: "buzzard.png",
      width: canvas.c.width * 0.1,
      height: canvas.c.width * 0.1,
      tiles: {
        0: {u0:   0, v0:   0, u1:   1, v1: 1/2},
        1: {u0:   0, v0: 1/2, u1:   1, v1:   1},
        dead0: {u0: 0.0, v0: 2/3, u1: 0.5, v1: 1.0},
        dead1: {u0: 0.5, v0: 2/3, u1: 1.0, v1: 1.0},
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
        bed1: {offsetY: 20, u0: 1/4, v0: 0.0, u1: 4/4, v1: 1/4},
        bed2: {offsetY: 20, u0: 1/4, v0: 1/4, u1: 4/4, v1: 2/4},
        bed3: {offsetY: 20, u0: 1/4, v0: 2/4, u1: 4/4, v1: 3/4},
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
      loadSprite(this.buzzard, canvas),
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

    const {tiles, state, states, nextFrame} = this.char
    this.drawBed(c, s.bedLevel)
    renderObject(c, this.char, states[state][nextFrame])

    renderObject(c, this.icons, "hunger")
    renderObject(c, this.icons, "sleep")
    renderObject(c, this.icons, "mood")
    c.pop()
    c.flush()
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

  this.drawBuzzards = (canvas, buzzards) => {
    canvas.push()
    canvas.trans(0, 0)
    buzzards.forEach(({x=0, y=0, halt, frame = 0}, i) => {
      const nextFrame = (halt ? frame : frame + 1) % 2
      renderObject(canvas, {
        ...this.buzzard,
        posX: x * canvas.c.width,
        posY: y * canvas.c.height
      }, nextFrame)
      buzzards[i].frame = nextFrame
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
    const {wiflies, deadWiflies, buzzards} = this.state
    this.state.wiflies = wiflies.map(updatePosition)
    this.state.deadWiflies = deadWiflies.map(updatePosition)
    this.state.buzzards = buzzards.map(updateHPosition)
  }

  const BUZZARD_VELOCITY = 0.005
  const updateHPosition = (props) => {
    const {x=0} = props

    return {
      ...props,
      x: x > 1.0 ? -0.1 : x + BUZZARD_VELOCITY
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

    e.on('sound', () => {
      this.hadSound = true
    })

    this.state.buzzards.push({
      x: -0.1,
      y: 0.55 + Math.random()*0.1
    })
    this.state.buzzards.push({
      x: -0.2,
      y: 0.55 + Math.random()*0.1
    })
    this.state.buzzards.push({
      x: -0.3,
      y: 0.55 + Math.random()*0.1
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
  const LOUD_SOUND_THERESHOLD = 7000

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

  this.hadSoundSpike = () => this.getLevel() > LOUD_SOUND_THERESHOLD

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
window.off = (el, ev) => el.removeEventListener(ev)
window.click = (el,c) => on(el, 'click',c)
