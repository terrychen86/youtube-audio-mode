import VideoRequestService from './services/video-request';
import EVENTS from './constants/events';

VideoRequestService.start();

VideoRequestService.onReceiveAudio(({ audioUrl, details }) => {
  const { tabId } = details;
  chrome.tabs.sendMessage(tabId, { audioUrl });
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.name !== EVENTS.TOGGLE_AUDIO_MODE) {
    return;
  }

  try {
    const { enableAudioMode } = request;
    if (enableAudioMode) {
      VideoRequestService.blockVideos();
    } else {
      VideoRequestService.unblockVideos();
    }

    sendResponse({ status: 'success' });
  } catch (err) {
    sendResponse({ status: 'error', err });
  }
});
