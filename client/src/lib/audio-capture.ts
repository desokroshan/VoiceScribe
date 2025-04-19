// Audio capture implementation using WebRTC

let audioStream: MediaStream | null = null;

/**
 * Create a mock audio stream for demonstration purposes
 * This is used when real microphone access is unavailable
 * @returns A MediaStream-like object that can be used for demos
 */
function createMockAudioStream(): MediaStream {
  // Create an "empty" audio context to simulate audio
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const destination = audioContext.createMediaStreamDestination();
  
  oscillator.connect(destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
  oscillator.start();
  
  console.log("Using mock audio stream for demonstration");
  return destination.stream;
}

/**
 * Initialize audio capture from the user's system
 * @returns A promise that resolves to the audio MediaStream
 */
export async function initializeAudioCapture(): Promise<MediaStream> {
  try {
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Media devices API not supported in this browser. Using mock data.');
      const mockStream = createMockAudioStream();
      audioStream = mockStream;
      return mockStream;
    }
    
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
    
    // For demonstration purposes, fall back to mock data
    console.warn('Using mock audio stream as a fallback');
    const mockStream = createMockAudioStream();
    audioStream = mockStream;
    return mockStream;
  }
}

/**
 * Capture system audio (note: this is limited by browser security)
 * In a full implementation, this would require an extension or desktop app 
 * @returns A promise that resolves to the system audio MediaStream
 */
export async function captureSystemAudio(): Promise<MediaStream> {
  try {
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.warn('Display Media API not supported in this browser. Using mock data.');
      const mockStream = createMockAudioStream();
      audioStream = mockStream;
      return mockStream;
    }
    
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
    
    // For demonstration purposes, fall back to mock data
    console.warn('Using mock audio stream as a fallback for system audio');
    const mockStream = createMockAudioStream();
    audioStream = mockStream;
    return mockStream;
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
