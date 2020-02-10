import url from 'url';
import VideoRequest, { ALLOW_REQUEST, BLOCK_REQUEST } from './utils/video-request';
import EVENTS from './constants/events';

VideoRequest.onRequestBlock(detail => {
  const { url: requestUrl, tabId } = detail;
  if (requestUrl.match(/mime=audio%2Fwebm/) === null) {
    return BLOCK_REQUEST;
  }

  const parsedRequest = url.parse(requestUrl, true);
  const { query } = parsedRequest;
  const filteredQuery = { ...query };
  delete filteredQuery['range'];
  delete filteredQuery['rbuf'];
  delete filteredQuery['rn'];

  const audioUrl: string = url.format({
    ...parsedRequest,
    search: undefined,
    query: filteredQuery,
  });

  chrome.tabs.sendMessage(tabId, { audioUrl });
  return ALLOW_REQUEST;
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.name !== EVENTS.TOGGLE_AUDIO_MODE) {
    return;
  }

  try {
    const { enableAudioMode } = request;
    if (enableAudioMode) {
      VideoRequest.block();
    } else {
      VideoRequest.unblock();
    }

    sendResponse({ status: 'success' });
  } catch (err) {
    sendResponse({ status: 'error', err });
  }
});
