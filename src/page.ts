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
    setAttributes(switchIconPath,{"d": "M8.075 20h-2.45q-.7 0-1.162-.462Q4 19.075 4 18.375V12q0-1.675.625-3.125t1.713-2.537Q7.425 5.25 8.875 4.625T12 4q1.675 0 3.125.625t2.538 1.713q1.087 1.087 1.712 2.537T20 12v6.375q0 .7-.462 1.163-.463.462-1.163.462h-2.45v-6.15H19V12q0-2.925-2.038-4.963Q14.925 5 12 5T7.038 7.037Q5 9.075 5 12v1.85h3.075Z", "fill": "white"});
  
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
      const parentNode = document.querySelector('#ytp-id-18 > div.ytp-panel > div.ytp-panel-menu');
      const refNode = document.querySelector('#ytp-id-18 > div.ytp-panel > div.ytp-panel-menu > div');
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
