import EVENTS from './constants/events';
import './sass/styles.scss';

const isAudioModeActive = (): boolean => localStorage.getItem('enableAudioMode') === 'true';

const handleAudioModeButtonClick = (): void => {
  const enableAudioMode = !isAudioModeActive();
  chrome.runtime.sendMessage({ name: EVENTS.TOGGLE_AUDIO_MODE, enableAudioMode }, response => {
    if (response.status !== 'success') {
      return;
    }

    localStorage.setItem('enableAudioMode', `${enableAudioMode}`);

    const audioModeButton = document.querySelector('.audio-mode-btn');
    audioModeButton.classList.toggle('active');
    if (isAudioModeActive()) {
      audioModeButton.textContent = 'AUDIO MODE: ON';
    } else {
      audioModeButton.textContent = 'AUDIO MODE: OFF';
      window.location.reload();
    }
  });
};

const createAudioButton = async (): Promise<void> =>
  new Promise<void>(resolve => {
    const audioModeButton = document.createElement('div');
    audioModeButton.classList.add('audio-mode-btn');
    audioModeButton.textContent = isAudioModeActive() ? 'AUDIO MODE: ON' : 'AUDIO MODE: OFF';

    const audioModeButtonWrapper = document.createElement('div');
    audioModeButtonWrapper.classList.add('audio-mode-btn-wrapper');
    if (isAudioModeActive()) {
      audioModeButton.classList.add('active');
    }
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

const listenAudioUrl = (): void => {
  let currentUrl: string | null = null;
  chrome.runtime.onMessage.addListener(request => {
    if (!isAudioModeActive()) {
      return;
    }

    if (request.audioUrl) {
      const { audioUrl } = request;
      if (currentUrl === window.location.search) {
        return;
      }
      currentUrl = window.location.search;

      const video: HTMLMediaElement = document.querySelector('video.video-stream.html5-main-video');
      video.pause();
      video.src = audioUrl;
      video.currentTime = 0;
      video.play();

      const shouldUpdateStyles = !document.querySelector('.html5-video-player.active');
      if (shouldUpdateStyles) {
        video.classList.add('audio-mode');
        const videoWrapper: HTMLDivElement = document.querySelector('.html5-video-player');
        videoWrapper.classList.add('active');
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await createAudioButton();
    listenAudioUrl();

    if (isAudioModeActive()) {
      handleAudioModeButtonClick();
    }
  } catch (err) {
    throw new Error(err);
  }
});
