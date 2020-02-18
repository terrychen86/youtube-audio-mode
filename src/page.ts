import YoutubeAudioModeClient from './clients/youtube-audio-mode-client';
import './sass/styles.scss';

const YTClient = new YoutubeAudioModeClient();

const showAudioModeOverlay = (): void => {
  const YTPlayerContainer: HTMLMediaElement = document.querySelector('div.html5-video-player');
  YTPlayerContainer.classList.add('active');
};

const hideAudioModeOverlay = (): void => {
  const YTPlayerContainer: HTMLMediaElement = document.querySelector('div.html5-video-player');
  YTPlayerContainer.classList.remove('active');
};

const handleAudioModeSwitchChange = (e): void => {
  const { checked } = e.target;
  if (checked) {
    showAudioModeOverlay();
    YTClient.startAudioMode();
  } else {
    hideAudioModeOverlay();
    YTClient.stopAudioMode();
  }
};

const createAudioModeSwitch = (): Promise<void> =>
  new Promise<void>(resolve => {
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await createAudioModeSwitch();
    let pollingVideoIntervalId: null | number = null;

    YTClient.onStartAudioMode(() => {
      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      pollingVideoIntervalId = setInterval(() => {
        const time = YTPlayer.currentTime;
        const src = YTPlayer.src;

        if (src.startsWith('blob')) {
          YTClient.pauseAudioMode();
        }

        if (time >= 1 && src.startsWith('blob')) {
          const isAdPlaying = !!document.querySelector('div.ad-showing');
          if (isAdPlaying) {
            return;
          }

          YTClient.resumeAudioMode();
          YTPlayer.src = YTClient.getAudioUrl();
          YTPlayer.currentTime = time;
          YTPlayer.play();
        }
      }, 500);
    });

    YTClient.onStopAudioMode(() => {
      const YTPlayer: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      const time = Math.floor(YTPlayer.currentTime);
      const { pathname, search } = window.location;
      const urlParams = new URLSearchParams(search);
      urlParams.set('t', `${time}s`);
      clearInterval(pollingVideoIntervalId);
      window.location.href = `${pathname}?${urlParams.toString()}`;
    });

    const isYoutubeRequestServiceActive = await YTClient.getServiceState();
    if (isYoutubeRequestServiceActive) {
      YTClient.stopAudioMode();
    }
  } catch (err) {}
});
