export type WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;
export type BlockingResponse = chrome.webRequest.BlockingResponse;
type VideoRequestListener = (details: WebRequestBodyDetails) => void;
type VideoRequest = {
  block: () => void;
  unblock: () => void;
  onRequestBlock: (fn: VideoRequestListener) => void;
};

export const ALLOW_REQUEST: BlockingResponse = { cancel: false };
export const BLOCK_REQUEST: BlockingResponse = { cancel: true };

let shouldBlockRequest = false;

const blockVideoRequest = (): void => {
  shouldBlockRequest = true;
};

const unblockVideoRequest = (): void => {
  shouldBlockRequest = false;
};

const onVideoRequestBlock = (listener: VideoRequestListener): void => {
  chrome.webRequest.onBeforeRequest.addListener(
    details => {
      if (!shouldBlockRequest) {
        return ALLOW_REQUEST;
      }

      const { initiator, type } = details;
      if (type !== 'xmlhttprequest') {
        return ALLOW_REQUEST;
      }

      if (initiator.match(/youtube\.com/) === null) {
        return ALLOW_REQUEST;
      }

      return listener(details);
    },
    { urls: ['*://*.googlevideo.com/*'] },
    ['blocking'],
  );
};

const publicAPI: VideoRequest = {
  block: blockVideoRequest,
  unblock: unblockVideoRequest,
  onRequestBlock: onVideoRequestBlock,
};

export default publicAPI;
