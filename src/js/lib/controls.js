function Controls ({emit}) {
  let speed = 0
  let interval
  let falling = true

  const track = el => ev => {
    if (el) {
      const x = el.offsetParent.offsetLeft + 8*px
      const y = el.offsetParent.offsetTop + 8*px
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
        emit('play')
      })
      on(document.body, 'touchend', () => {
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

  const gravitate = el => {
    speed = 0
    interval = setInterval(() => {
      if (!el || !el.offsetParent) {
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

  const handleToy = (el, btn, life=10) => ev => {
    el.classList.remove('hidden')
    el.style.width = `${16*px}px`
    el.style.height = `${16*px}px`
    el.style.top = `${32*px}px`
    el.style.left = `20%`
    on(el, 'touchstart', track(el))
    gravitate(el)
    emit('spend', btn.innerText)
    $ballBtn.setAttribute('disabled', true)
    $ballBtn.classList.add('disabled')
    $duckBtn.setAttribute('disabled', true)
    $duckBtn.classList.add('disabled')
    setTimeout(() => {
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
