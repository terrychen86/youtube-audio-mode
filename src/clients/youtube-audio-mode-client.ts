import { EventEmitter } from 'events';
import EVENTS from '../constants/events';

type Listener = () => void;

type ServiceState = {
  blockVideoRequests: boolean;
};

const START_AUDIO_MODE = 'START_AUDIO_MODE';
const PAUSE_AUDIO_MODE = 'PAUSE_AUDIO_MODE';
const RESUME_AUDIO_MODE = 'RESUME_AUDIO_MODE';
const STOP_AUDIO_MODE = 'STOP_AUDIO_MODE';

class YoutubeAudioModeClient extends EventEmitter {
  private status: 'STARTED' | 'PAUSED' | 'STOPPED';
  private audioUrl: string;

  constructor() {
    super();
    this.audioUrl = '';
    this.status = 'STOPPED';
    this.listenAudioUrlChange();
  }

  private listenAudioUrlChange(): void {
    chrome.runtime.onMessage.addListener(request => {
      const { audioUrl } = request;
      if (!audioUrl) {
        return;
      }

      this.audioUrl = audioUrl;
    });
  }

  private setServiceState({ blockVideoRequests }: ServiceState): void {
    chrome.runtime.sendMessage({ name: EVENTS.SET_YOUTUBE_REQUEST_SERVICE_STATE, blockVideoRequests }, response => {
      if (response.status !== 'success') {
        throw new Error();
      }
    });
  }

  getServiceState(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      chrome.runtime.sendMessage({ name: EVENTS.GET_YOUTUBE_REQUEST_SERVICE_STATE }, response => {
        if (response.status === 'success') {
          resolve(response.isYoutubeRequestServiceActive);
        } else {
          throw new Error();
        }
      });
    });
  }

  getAudioModeState(): string {
    return this.status;
  }

  getAudioUrl(): string {
    return this.audioUrl;
  }

  onStartAudioMode(listener: Listener): void {
    this.on(START_AUDIO_MODE, listener);
  }

  onPauseAudioMode(listener: Listener): void {
    this.on(STOP_AUDIO_MODE, listener);
  }

  onResumeAudioMode(listener: Listener): void {
    this.on(RESUME_AUDIO_MODE, listener);
  }

  onStopAudioMode(listener: Listener): void {
    this.on(STOP_AUDIO_MODE, listener);
  }

  startAudioMode(): void {
    if (this.status === 'STOPPED') {
      this.status = 'STARTED';
      this.emit(START_AUDIO_MODE);
      this.setServiceState({ blockVideoRequests: true });
    }
  }

  pauseAudioMode(): void {
    if (this.status === 'STARTED') {
      this.status = 'PAUSED';
      this.emit(PAUSE_AUDIO_MODE);
      this.setServiceState({ blockVideoRequests: false });
    }
  }

  resumeAudioMode(): void {
    if (this.status === 'PAUSED') {
      this.status = 'STARTED';
      this.emit(RESUME_AUDIO_MODE);
      this.setServiceState({ blockVideoRequests: true });
    }
  }

  stopAudioMode(): void {
    this.status = 'STOPPED';
    this.emit(STOP_AUDIO_MODE);
    this.setServiceState({ blockVideoRequests: false });
  }
}

export default YoutubeAudioModeClient;
