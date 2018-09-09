window.__ = (q) => document.querySelector(q)
window.on = (el, ev, c) => el.addEventListener(ev,c)
window.off = (el, type, ev) => el.removeEventListener(type, ev)
window.click = (el,c) => on(el, 'click',c)
