function Microphone () {
  let audioCtx
  let analyser
  let bufferLength
  let dataArray
  let valueAccumulator
  let valueCount
  let level = 0
  let average = 0

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
    level = Math.round(valueAccumulator / valueCount) || 0
    valueAccumulator = 0
    valueCount = 0
    highest = 0
    average = Math.round((average * 0.7) + level * 0.3)
    __('#sound').innerHTML = `${level}<br>${average}`
  }

  this.getLevel = () => {
    return level
  }

  this.hadSoundSpike = () => level > 2 * average

  init()
}
