import url from 'url';
import { EventEmitter } from 'events';

export type WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;
export type BlockingResponse = chrome.webRequest.BlockingResponse;

export const ALLOW_REQUEST: BlockingResponse = { cancel: false };
export const BLOCK_REQUEST: BlockingResponse = { cancel: true };

type Listener = (props: { audioUrl: string; tabId: number }) => void;

const RECEIVE_AUDIO_URL = 'RECEIVE_AUDIO_URL';

class YoutubeRequestService extends EventEmitter {
  private isServiceActive: boolean;
  private tabAudioUrlMap: Map<number, string>;
  private blockedTabs: Set<number>;

  constructor() {
    super();
    this.init();
    this.extractAudioUrl();
    this.processHttpRequests();
  }

  private init(): void {
    this.isServiceActive = false;
    this.tabAudioUrlMap = new Map<number, string>();
    this.blockedTabs = new Set<number>();
  }

  private extractAudioUrl(): void {
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        if (!this.isServiceActive) {
          return;
        }

        const { initiator, type, tabId, url: requestUrl } = details;
        if (initiator.match(/www\.youtube\.com/) === null) {
          return;
        }

        if (type === 'xmlhttprequest' && requestUrl.match(/mime=audio/) !== null) {
          const parsedRequest = url.parse(requestUrl, true);
          const { query } = parsedRequest;
          const filteredQuery = { ...query };

          delete filteredQuery['range'];
          delete filteredQuery['rbuf'];
          delete filteredQuery['rn'];

          const audioUrl: string = url.format({
            ...parsedRequest,
            search: null,
            query: filteredQuery,
          });

          if (this.tabAudioUrlMap.get(tabId) !== audioUrl) {
            this.tabAudioUrlMap.set(tabId, audioUrl);
            this.emit(RECEIVE_AUDIO_URL, { audioUrl, tabId });
          }
        }
      },
      { urls: ['*://*.googlevideo.com/*'] },
    );
  }

  private processHttpRequests(): void {
    chrome.webRequest.onBeforeRequest.addListener(
      details => {
        if (!this.isServiceActive) {
          return ALLOW_REQUEST;
        }

        const { initiator, type, tabId, url: requestUrl } = details;

        if (initiator.match(/www\.youtube\.com/) === null) {
          return ALLOW_REQUEST;
        }

        if (!this.blockedTabs.has(tabId)) {
          return ALLOW_REQUEST;
        }

        if (type === 'xmlhttprequest' && requestUrl.match(/mime=video/) !== null) {
          this.blockedTabs.add(tabId);
          return BLOCK_REQUEST;
        }

        return ALLOW_REQUEST;
      },
      { urls: ['*://*.googlevideo.com/*'] },
      ['blocking'],
    );
  }

  onReceiveAudio(listener: Listener): void {
    this.on(RECEIVE_AUDIO_URL, listener);
  }

  start(): void {
    this.isServiceActive = true;
  }

  stop(): void {
    this.isServiceActive = false;
  }

  blockVideos(tabId: number): void {
    this.blockedTabs.add(tabId);
  }

  unblockVideos(tabId: number): void {
    this.blockedTabs.delete(tabId);
  }

  isActive(): boolean {
    return this.isServiceActive;
  }

  isBlockingVideo(tabId: number): boolean {
    return this.blockedTabs.has(tabId);
  }
}

export default new YoutubeRequestService();
