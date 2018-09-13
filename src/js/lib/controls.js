function Controls ({emit}) {
  let speed = 0
  let interval
  let isFalling = true
  let isPlaying = false

  const track = el => ev => {
    if (el) {
      const x = el.offsetParent.offsetLeft + 8*px
      const y = el.offsetParent.offsetTop + 8*px
      const touchMove = on(document.body, 'touchmove', ({changedTouches}) => {
        if (!el.offsetParent) {
          off(document.body, 'touchmove', touchMove)
          return
        }
        isFalling = false
        speed = 0
        const {clientY, clientX} = changedTouches[0]
        const left = Math.min(Math.max(0, clientX - x), el.offsetParent.clientWidth - 16*px)
        const top = Math.min(Math.max(0, clientY - y), el.offsetParent.clientHeight*0.6 - 16*px)
        el.style.top = `${Math.round(top / px) * px}px`
        el.style.left = `${Math.round(left / px) * px}px`
        emit('play')
      })
      on(document.body, 'touchend', () => {
        speed = 0
        isFalling = true
      })
    }
  }

  const gravitate = el => {
    clearInterval(interval)
    speed = 0
    interval = setInterval(() => {
      if (!el || !el.offsetParent) {
        clearInterval(interval)
        return
      }
      if (!isFalling) return
      const BOTTOM = el.offsetParent.clientHeight*0.5 + 9*px
      const pos = parseInt(el.style.top)
      const nextPost = pos + speed*px

      if (nextPost < BOTTOM) {
        console.log('is falling', speed);
        el.style.top = `${Math.round(nextPost)}px`
        speed++
      } else if (nextPost > BOTTOM) {
        el.style.top = `${BOTTOM}px`
        console.log('invert speed', speed*0.6);
        speed = -speed*0.6
        if (Math.abs(speed) < 1) {
          speed = 0
          isFalling = false
        }
      }
    }, 50)
  }

  const handleToy = (el, btn, life=10) => ev => {
    if (isPlaying) return

    isPlaying = true
    el.classList.remove('hidden')
    el.style.width = `${16*px}px`
    el.style.height = `${16*px}px`
    el.style.top = `${32*px}px`
    el.style.left = `20%`
    on(el, 'touchstart', track(el))
    gravitate(el)
    emit('spend', btn.innerText)
    $ballBtn.classList.add('disabled')
    $duckBtn.classList.add('disabled')
    setTimeout(() => {
      isPlaying = false
      $duckBtn.classList.remove('disabled')
      $ballBtn.classList.remove('disabled')
      el.classList.add('hidden')
      gravitate(null)
    }, life * 1000)
  }

  const $ballBtn = __('#ball')
  const $ball = __('.ball-toy')
  click($ballBtn, handleToy($ball, $ballBtn))

  const $duckBtn = __('#duck')
  const $duck = __('.duck-toy')
  click($duckBtn, handleToy($duck, $duckBtn, 20))

  click(__('#bed'), e => {
    emit('upgrade')
  })
  click(__('#feed'), e => {
    emit('consume')
  })
}
