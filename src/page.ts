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

const createAudioModeSwitch = (): Promise<void> =>
  new Promise<void>(resolve => {
    // create a function to set multiple attributes at once
    function setAttributes(el, attrs) {
      for(var key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    }

    //Create the switch button
    const switchWrapper = document.createElement('div');
    switchWrapper.classList.add('ytp-menuitem-content');

    const switchInput = document.createElement('div');
    switchInput.classList.add('ytp-menuitem-toggle-checkbox');

    switchWrapper.appendChild(switchInput);
  
    //Add the svg icon
    const switchIconWrapper = document.createElement('div');
    switchIconWrapper.classList.add('ytp-menuitem-icon');
    
    const switchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttributes(switchIcon, {"width": "24","height": "24", "viewBox": "0 0 24 24", "fill": "none"});
  
    //Path of svg
    const switchIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    setAttributes(switchIconPath,{"d": "M12 1C7.03 1 3 5.03 3 10V17C3 18.66 4.34 20 6 20H9V12H5V10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10V12H15V20H18C19.66 20 21 18.66 21 17V10C21 5.03 16.97 1 12 1Z", "fill": "white"});
  
    switchIconWrapper.appendChild(switchIcon);
    switchIcon.appendChild(switchIconPath);
  
    //Add the switch label
    const switchName = document.createElement('div');
    switchName.classList.add('ytp-menuitem-label');
    switchName.textContent = 'Audio mode';
  
    //Create item in Youtube menu
    const audioModeController = document.createElement('div');
    audioModeController.classList.add('ytp-menuitem');
    setAttributes(audioModeController, {"id": "audioMode", "role": "menuitemcheckbox", "aria-checked": "false", "tabindex": "0"});
  
    audioModeController.appendChild(switchIconWrapper);
    audioModeController.appendChild(switchName);
    audioModeController.appendChild(switchWrapper);  
  
    //Add event listener
    switchInput.addEventListener('click', function() {
      const Toggle = document.getElementById('audioMode');
    
      //Check if on or off to start or stop audio mode 
      if (Toggle.getAttribute('aria-checked') === 'false') {
        Toggle.setAttribute('aria-checked', 'true');
        showAudioModeOverlay();
        YTClient.startAudioMode();
      } else {
        Toggle.setAttribute('aria-checked', 'false');
        hideAudioModeOverlay();
        YTClient.stopAudioMode();
      }
    });

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
