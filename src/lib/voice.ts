export class VoiceService {
  private recognition: any = null;
  private synth = window.speechSynthesis;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject("Speech recognition not supported");
        return;
      }

      this.recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        resolve(text);
      };

      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };

      this.recognition.start();
    });
  }

  speak(text: string, lang: string = 'hi-IN') {
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export const voiceService = new VoiceService();
