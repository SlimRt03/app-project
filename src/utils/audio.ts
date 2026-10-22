// Audio utility for generating authentic RP radio comms audio buffers
export function createSimulatedRadioCommsBlob(): Promise<Blob> {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const sampleRate = ctx.sampleRate;
      const duration = 3.2; // 3.2 seconds
      const numSamples = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, numSamples, sampleRate);
      const channel = buffer.getChannelData(0);

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        if (t < 0.12) {
          // Push-to-talk mic click & tone (780Hz)
          channel[i] = Math.sin(2 * Math.PI * 780 * t) * 0.35;
        } else if (t > duration - 0.15) {
          // Roger beep squelch tone (440Hz)
          channel[i] = Math.sin(2 * Math.PI * 440 * t) * 0.25;
        } else {
          // Realistic filtered comms radio crackle + crew voice carrier tone
          const voice1 = Math.sin(2 * Math.PI * 260 * t) * 0.25;
          const voice2 = Math.sin(2 * Math.PI * 340 * t) * 0.15;
          const noise = (Math.random() * 2 - 1) * 0.07;
          const tremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 5 * t);
          channel[i] = (voice1 + voice2 + noise) * tremolo;
        }
      }

      // Convert buffer to 16-bit PCM WAV Blob
      const wavBytes = bufferToWave(buffer, numSamples);
      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      resolve(blob);
    } catch {
      // Fallback empty audio blob if AudioContext unsupported
      resolve(new Blob([], { type: 'audio/wav' }));
    }
  });
}

function bufferToWave(abuffer: AudioBuffer, totalSamples: number) {
  const numOfChan = abuffer.numberOfChannels;
  const length = totalSamples * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // format chunk identifier
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // format chunk length
  setUint16(1); // sample format (raw)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // data chunk identifier
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return out.buffer;
}
