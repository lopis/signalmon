function Microphone () {
  let audioCtx
  let analyser
  let bufferLength
  let dataArray
  let valueAccumulator
  let valueCount
  let level = 0

  // TODO: adapt the sound limits throughout the game runtime
  // By collecting the loudest and quietest possible sounds
  const LOUD_SOUND_THERESHOLD = 200

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
