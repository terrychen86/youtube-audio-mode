import YoutubeAudioModeService from './services/youtube-audio-mode';
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
    },
  );
};

const createAudioModeButton = async (): Promise<void> => {
  return new Promise<void>(resolve => {
    const audioModeButton = document.createElement('div');
    audioModeButton.classList.add('audio-mode-btn');
    audioModeButton.textContent = 'AUDIO MODE: OFF';

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

      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      const time = Math.floor(YTPlayer.currentTime);

      const { pathname, search } = window.location;
      window.location.href = `${pathname}${search}&t=${time}s`;
    });

    YoutubeAudioModeService.onAudioChange(audioUrl => {
      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      YTPlayer.pause();
      const time = YTPlayer.currentTime;
      YTPlayer.src = audioUrl;
      YTPlayer.currentTime = 0;
      YTPlayer.play();
      YTPlayer.currentTime = time;
    });
  } catch (err) {
    throw new Error(err);
  }
});
