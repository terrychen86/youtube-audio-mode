import YoutubeAudioModeService from './services/youtube-audio-mode';
import chromeStorage from './utils/storage';
import EVENTS from './constants/events';
import './sass/styles.scss';

const handleAudioModeButtonClick = (): void => {
  chrome.runtime.sendMessage(
    { name: EVENTS.TOGGLE_AUDIO_MODE, enableAudioMode: !YoutubeAudioModeService.isAudioModeActive() },
    response => {
      if (response.status !== 'success') {
        return;
      }

      if (response.enableAudioMode) {
        YoutubeAudioModeService.start();
      } else {
        YoutubeAudioModeService.stop();
      }

      chromeStorage.set({ audioModeStatus: response.enableAudioMode }).then();
    },
  );
};

const createAudioModeButton = async (): Promise<void> => {
  return new Promise<void>(resolve => {
    const audioModeButton = document.createElement('div');
    audioModeButton.classList.add('audio-mode-btn');
    audioModeButton.textContent = 'Loading...';

    const audioModeButtonWrapper = document.createElement('div');
    audioModeButtonWrapper.classList.add('audio-mode-btn-wrapper');
    audioModeButtonWrapper.appendChild(audioModeButton);
    audioModeButton.addEventListener('click', handleAudioModeButtonClick);

    const tryInsertElem = function pollingUntilSuccess(): void {
      const parentNode = document.querySelector('#top-row.style-scope.ytd-video-secondary-info-renderer');
      const refNode = document.querySelector('#subscribe-button.style-scope.ytd-video-secondary-info-renderer');
      if (!parentNode?.children?.length || !refNode) {
        requestAnimationFrame(() => tryInsertElem());
        return;
      }

      resolve();
      parentNode.insertBefore(audioModeButtonWrapper, refNode);
    };

    tryInsertElem();
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const isActive = await chromeStorage.get('audioModeStatus');
    await createAudioModeButton();

    YoutubeAudioModeService.onStart(() => {
      const audioButton: HTMLDivElement = document.querySelector('.audio-mode-btn');
      audioButton.textContent = 'AUDIO MODE: ON';
      audioButton.classList.add('active');
    });

    YoutubeAudioModeService.onStop(() => {
      const audioButton: HTMLDivElement = document.querySelector('.audio-mode-btn');
      audioButton.textContent = 'AUDIO MODE: OFF';
      audioButton.classList.remove('active');
    });

    YoutubeAudioModeService.onAudioChange(audioUrl => {
      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      YTPlayer.pause();
      const time = YTPlayer.currentTime;
      YTPlayer.src = audioUrl;
      YTPlayer.currentTime = 0;
      YTPlayer.load();
      YTPlayer.currentTime = time;
      YTPlayer.play();
    });

    if (isActive) {
      YoutubeAudioModeService.start();
    } else {
      YoutubeAudioModeService.stop();
    }
  } catch (err) {
    throw new Error(err);
  }
});

// const listenAudioUrl = (): void => {
//   let currentUrl: string | null = null;
//   chrome.runtime.onMessage.addListener(request => {
//     if (!active) {
//       return;
//     }

//     if (request.audioUrl) {
//       const { audioUrl } = request;
//       if (currentUrl === window.location.search) {
//         return;
//       }
//       currentUrl = window.location.search;

//       const video: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
//       video.pause();
//       video.src = audioUrl;
//       video.currentTime = 0;
//       video.load();
//       video.play();

//       const shouldUpdateStyles = !document.querySelector('.html5-video-player.active');
//       if (shouldUpdateStyles) {
//         video.classList.add('audio-mode');
//         const videoWrapper: HTMLDivElement = document.querySelector('.html5-video-player');
//         videoWrapper.classList.add('active');
//       }
//     }
//   });
// };

// listenAudioUrl();
