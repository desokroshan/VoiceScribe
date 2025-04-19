// Audio capture implementation using WebRTC

let audioStream: MediaStream | null = null;

/**
 * Initialize audio capture from the user's system
 * @returns A promise that resolves to the audio MediaStream
 */
export async function initializeAudioCapture(): Promise<MediaStream> {
  try {
    // Request audio permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    
    audioStream = stream;
    return stream;
  } catch (error) {
    console.error('Error capturing audio:', error);
    throw new Error('Failed to initialize audio capture. Please check permissions and try again.');
  }
}

/**
 * Capture system audio (note: this is limited by browser security)
 * In a full implementation, this would require an extension or desktop app 
 * @returns A promise that resolves to the system audio MediaStream
 */
export async function captureSystemAudio(): Promise<MediaStream> {
  try {
    // In a real implementation, this would use getDisplayMedia to capture system audio
    // Note: This is not fully supported across all browsers and may require special permissions
    // @ts-ignore - TypeScript doesn't recognize the mediaSource option
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    
    audioStream = stream;
    return stream;
  } catch (error) {
    console.error('Error capturing system audio:', error);
    throw new Error('Failed to capture system audio. This feature may not be supported in your browser.');
  }
}

/**
 * Stop all audio capture
 */
export function stopAudioCapture(): void {
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
}

/**
 * Get the audio level from the stream for visualization
 * @param stream The audio MediaStream
 * @returns A function that can be called to get the current audio level (0-1)
 */
export function getAudioLevelMeter(stream: MediaStream): () => number {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  return () => {
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    
    const average = sum / bufferLength;
    return average / 255; // Normalize to 0-1
  };
}
