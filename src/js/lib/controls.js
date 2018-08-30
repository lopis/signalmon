function Controls ({emit}) {
  const track = el => ev => {
    if (!el) {
      document.body.onmousemove = null
    } else {
      const x = el.offsetParent.offsetLeft
      const y = el.offsetParent.offsetTop
      document.body.onmousemove = ({clientX, clientY}) => {
        console.log('ev', clientY, y);
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
