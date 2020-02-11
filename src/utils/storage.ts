export type ChromeData = { [key: string]: string };

const chromeStorageGet = (key: string): Promise<ChromeData> =>
  new Promise<ChromeData>(resolve => {
    chrome.storage.local.get(key, item => {
      resolve(item);
    });
  });

const chromeStorageSet = (data: ChromeData): Promise<void> =>
  new Promise<void>(resolve => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });

const chromeStorage = {
  get: chromeStorageGet,
  set: chromeStorageSet,
};

export default chromeStorage;
