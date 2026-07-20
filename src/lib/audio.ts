let context: AudioContext | null = null
let source: AudioBufferSourceNode | null = null

export function stopRailSound() {
  source?.stop()
  source = null
  void context?.close()
  context = null
}

export async function startRailSound() {
  stopRailSound()
  const AudioContextClass = window.AudioContext
  context = new AudioContextClass()
  await context.resume()

  const seconds = 3
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
  const channel = buffer.getChannelData(0)
  let previous = 0
  for (let index = 0; index < channel.length; index += 1) {
    const white = Math.random() * 2 - 1
    previous = previous * 0.985 + white * 0.015
    const railPulse = index % Math.floor(context.sampleRate * 0.72) < 180 ? 0.34 : 0
    channel[index] = previous * 0.42 + railPulse * Math.exp(-(index % Math.floor(context.sampleRate * 0.72)) / 45)
  }

  source = context.createBufferSource()
  const lowPass = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  source.loop = true
  lowPass.type = 'lowpass'
  lowPass.frequency.value = 820
  gain.gain.value = 0.035
  source.connect(lowPass).connect(gain).connect(context.destination)
  source.start()
}
