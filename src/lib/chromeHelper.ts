export const getChromeActiveTab = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
};

export const reloadChromeActiveTab = async () => {
  const tab = await getChromeActiveTab();
  if (tab.id) {
    await chrome.tabs.reload(tab.id);
  }
};

export const updateChromeTab = async (
  updateProperties: chrome.tabs.UpdateProperties,
) => {
  await chrome.tabs.update(updateProperties);
};

export const removeChromeStorageItems = async (keys: string[]) => {
  await chrome.storage.local.remove(keys);
};

export const getChromeStorage = async <T>(
  keys: string | string[] | null,
): Promise<T> => {
  const result = await chrome.storage.local.get(keys);
  return result as T;
};

export const setToChromeStorage = async <T>(
  key: string,
  value: T,
): Promise<void> => {
  await chrome.storage.local.set({ [key]: value });
};

export const getAllChromeStorage = async () => {
  return await chrome.storage.local.get(null);
};
