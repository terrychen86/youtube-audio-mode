import url from 'url';
import { EventEmitter } from 'events';
import EVENTS from '../constants/events';

export type WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;
export type BlockingResponse = chrome.webRequest.BlockingResponse;

export const ALLOW_REQUEST: BlockingResponse = { cancel: false };
export const BLOCK_REQUEST: BlockingResponse = { cancel: true };

type Listener = (props: { audioUrl: string; details: WebRequestBodyDetails; range: string }) => void;

class YoutubeRequestService extends EventEmitter {
  private shouldBlockRequest: boolean;
  private isServiceActive: boolean;

  constructor() {
    super();
    this.init();
    this.processHttpRequests();
  }

  private init(): void {
    this.shouldBlockRequest = false;
    this.isServiceActive = false;
  }

  private processHttpRequests(): void {
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        if (!this.isServiceActive) {
          return ALLOW_REQUEST;
        }

        const { initiator, type } = details;

        if (initiator.match(/www\.youtube\.com/) === null) {
          return ALLOW_REQUEST;
        }

        const { url: requestUrl } = details;
        if (type === 'media') {
          return ALLOW_REQUEST;
        }

        if (type === 'xmlhttprequest' && requestUrl.match(/mime=audio/) === null) {
          return this.shouldBlockRequest ? BLOCK_REQUEST : ALLOW_REQUEST;
        }

        if (type === 'xmlhttprequest' && requestUrl.match(/mime=audio/) !== null) {
          const parsedRequest = url.parse(requestUrl, true);
          const { query } = parsedRequest;
          const { range } = query;
          const filteredQuery = { ...query };

          delete filteredQuery['range'];
          delete filteredQuery['rbuf'];
          delete filteredQuery['rn'];

          const audioUrl: string = url.format({
            ...parsedRequest,
            search: null,
            query: filteredQuery,
          });

          this.emit(EVENTS.RECEIVE_AUDIO_URL, { audioUrl, details, range });
        }

        return ALLOW_REQUEST;
      },
      { urls: ['*://*.googlevideo.com/*'] },
      ['blocking'],
    );
  }

  onReceiveAudio(listener: Listener): void {
    this.on(EVENTS.RECEIVE_AUDIO_URL, listener);
  }

  start(): void {
    this.isServiceActive = true;
  }

  stop(): void {
    this.isServiceActive = false;
  }

  blockVideos(): void {
    this.shouldBlockRequest = true;
  }

  unblockVideos(): void {
    this.shouldBlockRequest = false;
  }

  isActive(): boolean {
    return this.isServiceActive;
  }

  isBlockingVideo(): boolean {
    return this.shouldBlockRequest;
  }
}

export default new YoutubeRequestService();
