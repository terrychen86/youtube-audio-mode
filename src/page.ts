import YoutubeAudioModeService from './services/youtube-audio-mode';
import EVENTS from './constants/events';
import './sass/styles.scss';

const handleAudioModeSwitchChange = (e): void => {
  const { checked } = e.target;
  chrome.runtime.sendMessage({ name: EVENTS.TOGGLE_AUDIO_MODE, enableAudioMode: checked }, response => {
    if (response.status !== 'success') {
      return;
    }

    if (response.enableAudioMode) {
      YoutubeAudioModeService.start();
    } else {
      YoutubeAudioModeService.stop();
    }
  });
};

const createAudioModeSwitch = async (): Promise<void> => {
  return new Promise<void>(resolve => {
    const switchWrapper = document.createElement('label');
    switchWrapper.classList.add('switch');

    const switchInput = document.createElement('input');
    switchInput.setAttribute('type', 'checkbox');
    switchInput.classList.add('audio-mode-switch');

    const switchPlaceholder = document.createElement('span');
    switchPlaceholder.classList.add('slider', 'round');

    switchWrapper.appendChild(switchInput);
    switchWrapper.appendChild(switchPlaceholder);

    const switchName = document.createElement('span');
    switchName.classList.add('audio-mode-switch-name');
    switchName.textContent = 'AUDIO MODE';

    const audioModeController = document.createElement('div');
    audioModeController.classList.add('audio-mode-controller');
    audioModeController.appendChild(switchWrapper);
    audioModeController.appendChild(switchName);
    switchInput.addEventListener('change', handleAudioModeSwitchChange);

    const tryInsertElem = function pollingUntilSuccess(): void {
      const parentNode = document.querySelector('#top-row.style-scope.ytd-video-secondary-info-renderer');
      const refNode = document.querySelector('#subscribe-button.style-scope.ytd-video-secondary-info-renderer');
      if (!parentNode?.children?.length || !refNode) {
        requestAnimationFrame(() => tryInsertElem());
        return;
      }

      resolve();
      parentNode.insertBefore(audioModeController, refNode);
    };

    tryInsertElem();
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await createAudioModeSwitch();

    YoutubeAudioModeService.onStart(() => {
      const YTPlayerContainer: HTMLMediaElement = document.querySelector('div.html5-video-player');
      YTPlayerContainer.classList.add('active');

      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      YTPlayer.preload = 'true';
    });

    YoutubeAudioModeService.onStop(() => {
      const YTPlayerContainer: HTMLMediaElement = document.querySelector('div.html5-video-player');
      YTPlayerContainer.classList.remove('active');

      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      const time = Math.floor(YTPlayer.currentTime);

      const { pathname, search } = window.location;
      const urlParams = new URLSearchParams(search);
      urlParams.set('t', `${time}s`);
      window.location.href = `${pathname}?${urlParams.toString()}`;
    });

    YoutubeAudioModeService.onAudioChange(audioUrl => {
      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      const time = YTPlayer.currentTime;
      YTPlayer.src = audioUrl;
      YTPlayer.currentTime = time;
      YTPlayer.play();
    });
  } catch (err) {}
});
