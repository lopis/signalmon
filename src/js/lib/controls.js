function Controls ({emit}) {
  const track = el => ev => {
    if (!el) {
      console.log('touch end')
      document.body.onmousemove = null
    } else {
      const x = el.offsetParent.offsetLeft + 32
      const y = el.offsetParent.offsetTop + 32
      console.log('touch start', x, y)
      document.body.ontouchmove = ({changedTouches}) => {
        const {clientY, clientX} = changedTouches[0]
        el.style.top = `${clientY - y}px`
        el.style.left = `${clientX - x}px`
      }
      // on(document.body, 'mouseup', track(null))
      on(document.body, 'touchend', track(null))
      // on(document.body, 'mouseleave', track(null))
    }
  }

  click(__('#ball'), e => {
    console.log('#ball')
  })
  click(__('#duck'), e => {
    __('#duck').setAttribute('disabled', true)
    const duck = document.createElement('div')
    duck.className = 'duck-toy'
    // on(duck, 'mousedown', track(duck))
    on(duck, 'touchstart', track(duck))
    __('#app').appendChild(duck)
  })
  click(__('#bed'), e => {
    emit('upgrade')
  })
  click(__('#feed'), e => {
    emit('consume')
  })
}
