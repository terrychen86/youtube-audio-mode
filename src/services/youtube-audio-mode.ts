import { EventEmitter } from 'events';
import EVENTS from '../constants/events';

type Listener = () => void;
type AudioChangeListener = (audioUrl: string) => void;

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

        this.emit(EVENTS.UI_RECEIVE_AUDIO_URL, audioUrl);
        return;
      }

      if (rangeEnd && +this.rangeEnd < +rangeEnd) {
        this.rangeEnd = rangeEnd;
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
    this.isAudioModeActive = true;
    this.emit(EVENTS.UI_START_AUDIO_MODE);
  }

  stop(): void {
    this.isAudioModeActive = false;
    this.emit(EVENTS.UI_STOP_AUDIO_MODE);
  }

  isActive(): boolean {
    return this.isAudioModeActive;
  }
}

export default new YoutubeAudioModeService();
