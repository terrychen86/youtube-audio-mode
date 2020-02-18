import YoutubeRequestService from './services/youtube-request-service';
import EVENTS from './constants/events';

YoutubeRequestService.onReceiveAudio(({ audioUrl, tabId }) => {
  chrome.tabs.sendMessage(tabId, { audioUrl });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name !== EVENTS.SET_YOUTUBE_REQUEST_SERVICE_STATE) {
    return;
  }

  try {
    const { blockVideoRequests } = request;
    const { id: tabId } = sender.tab;
    if (blockVideoRequests) {
      YoutubeRequestService.blockVideos(tabId);
    } else {
      YoutubeRequestService.unblockVideos(tabId);
    }

    sendResponse({
      status: 'success',
      blockVideoRequests: YoutubeRequestService.isActive() && YoutubeRequestService.isBlockingVideo(tabId),
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
