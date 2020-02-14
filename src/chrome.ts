import YoutubeRequestService from './services/youtube-request';
import EVENTS from './constants/events';

YoutubeRequestService.onReceiveAudio(({ audioUrl, details, range }) => {
  const { tabId } = details;
  chrome.tabs.sendMessage(tabId, { audioUrl, range });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name !== EVENTS.SET_YOUTUBE_REQUEST_SERVICE_STATE) {
    return;
  }

  try {
    const { enableAudioMode } = request;
    const { id: tabId } = sender.tab;
    if (enableAudioMode) {
      YoutubeRequestService.blockVideos(tabId);
    } else {
      YoutubeRequestService.unblockVideos(tabId);
    }

    sendResponse({
      status: 'success',
      enableAudioMode: YoutubeRequestService.isActive() && YoutubeRequestService.isBlockingVideo(tabId),
    });
  } catch (err) {
    sendResponse({ status: 'error', err });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name !== EVENTS.GET_YOUTUBE_REQUEST_SERVICE_STATE) {
    return;
  }

  try {
    const { id: tabId } = sender.tab;
    sendResponse({
      status: 'success',
      isYoutubeRequestServiceActive: YoutubeRequestService.isActive() && YoutubeRequestService.isBlockingVideo(tabId),
    });
  } catch (err) {
    sendResponse({ status: 'error', err });
  }
});

YoutubeRequestService.start();
