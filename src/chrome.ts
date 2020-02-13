import YoutubeRequestService from './services/youtube-request';
import EVENTS from './constants/events';

YoutubeRequestService.onReceiveAudio(({ audioUrl, details, range }) => {
  const { tabId } = details;
  chrome.tabs.sendMessage(tabId, { audioUrl, range });
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.name !== EVENTS.TOGGLE_AUDIO_MODE) {
    return;
  }

  try {
    const { enableAudioMode } = request;
    if (enableAudioMode) {
      YoutubeRequestService.blockVideos();
    } else {
      YoutubeRequestService.unblockVideos();
    }

    sendResponse({
      status: 'success',
      enableAudioMode: YoutubeRequestService.isActive() && YoutubeRequestService.isBlockingVideo(),
    });
  } catch (err) {
    sendResponse({ status: 'error', err });
  }
});

YoutubeRequestService.start();
