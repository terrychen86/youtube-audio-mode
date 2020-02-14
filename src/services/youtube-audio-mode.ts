import { EventEmitter } from 'events';

type Listener = () => void;
type AudioChangeListener = (audioUrl: string) => void;

const AUDIO_URL_CHANGE = 'AUDIO_URL_CHANGE';
const START_AUDIO_MODE = 'START_AUDIO_MODE';
const STOP_AUDIO_MODE = 'STOP_AUDIO_MODE';

class YoutubeAudioModeService extends EventEmitter {
  private isAudioModeActive: boolean;
  private audioId: string;
  private rangeEnd: string;

  constructor() {
    super();
    this.listenAudioUrlChange();
  }

  private listenAudioUrlChange(): void {
    chrome.runtime.onMessage.addListener(request => {
      const { audioUrl, range } = request;
      if (!audioUrl || typeof audioUrl !== 'string') {
        return;
      }

      if (!this.isAudioModeActive) {
        return;
      }

      const [ei] = audioUrl.match(/\&ei=.{10}/g);
      const id = window.location.search + ei;
      const rangeEnd: undefined | string = range.split('-')[1];

      if (this.audioId !== id) {
        this.audioId = id;

        if (rangeEnd) {
          this.rangeEnd = rangeEnd;
        }

        this.emit(AUDIO_URL_CHANGE, audioUrl);
        return;
      }

      if (rangeEnd && +this.rangeEnd < +rangeEnd) {
        this.rangeEnd = rangeEnd;
        this.emit(AUDIO_URL_CHANGE, audioUrl);
      }
    });
  }

  onAudioChange(listener: AudioChangeListener): void {
    this.on(AUDIO_URL_CHANGE, listener);
  }

  onStart(listener: Listener): void {
    this.on(START_AUDIO_MODE, listener);
  }

  onStop(listener: Listener): void {
    this.on(STOP_AUDIO_MODE, listener);
  }

  start(): void {
    this.isAudioModeActive = true;
    this.emit(START_AUDIO_MODE);
  }

  stop(): void {
    this.isAudioModeActive = false;
    this.emit(STOP_AUDIO_MODE);
  }

  isActive(): boolean {
    return this.isAudioModeActive;
  }
}

export default new YoutubeAudioModeService();
