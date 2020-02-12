import { EventEmitter } from 'events';
import EVENTS from '../constants/events';

type Listener = () => void;
type AudioChangeListener = (audioUrl: string) => void;

class YoutubeAudioModeService extends EventEmitter {
  private isActive: boolean;
  private audioId: string;

  constructor() {
    super();
    this.listenAudioUrlChange();
  }

  private listenAudioUrlChange(): void {
    chrome.runtime.onMessage.addListener(request => {
      const { audioUrl } = request;
      if (!audioUrl || typeof audioUrl !== 'string') {
        return;
      }

      if (!this.isActive) {
        return;
      }
      const [ei] = audioUrl.match(/\&ei=/g);
      const id = window.location.search + ei.substring(0, 5);
      if (this.audioId !== id) {
        this.audioId = id;
        this.emit(EVENTS.UI_RECEIVE_AUDIO_URL, audioUrl);
      }
    });
  }

  onAudioChange(listener: AudioChangeListener): void {
    this.on(EVENTS.UI_RECEIVE_AUDIO_URL, listener);
  }

  onStart(listener: Listener): void {
    this.on(EVENTS.UI_START_AUDIO_MODE, listener);
  }

  onStop(listener: Listener): void {
    this.on(EVENTS.UI_STOP_AUDIO_MODE, listener);
  }

  start(): void {
    this.isActive = true;
    this.emit(EVENTS.UI_START_AUDIO_MODE);
  }

  stop(): void {
    this.isActive = false;
    this.emit(EVENTS.UI_STOP_AUDIO_MODE);
  }

  isAudioModeActive(): boolean {
    return this.isActive;
  }
}

export default new YoutubeAudioModeService();
