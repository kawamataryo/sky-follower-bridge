import cssText from "data-text:~style.content.css";
import type { AtpSessionData } from "@atproto/api";
import type { PlasmoCSConfig } from "plasmo";
import React, { useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import Modal from "~components/Modal";
import { ProfileDetectedUserListItem } from "~components/ProfileDetectedUserListItem";
import { useProfileSearch } from "~hooks/useProfileSearch";
import { BskyServiceWorkerClient } from "~lib/bskyServiceWorkerClient";
import { getChromeStorage } from "~lib/chromeHelper";
import { STORAGE_KEYS } from "~lib/constants";
import { debugLog } from "~lib/utils";
import { TikTokProfileService } from "~services/tikTokProfileService";
import { XProfileService } from "~services/xProfileService";

export const config: PlasmoCSConfig = {
  matches: [
    "https://twitter.com/*",
    "https://x.com/*",
    "https://www.tiktok.com/*",
  ],
  all_frames: true,
};

export const getStyle = () => {
  const style = document.createElement("style");
  // patch for shadow dom
  style.textContent = cssText.replaceAll(":root", ":host");
  return style;
};

const getProfileService = () => {
  const hostname = window.location.hostname;
  if (hostname === "www.tiktok.com") {
    return new TikTokProfileService();
  }
  return new XProfileService();
};

const hasValidSession = async (session: AtpSessionData) => {
  let isValid = false;
  try {
    const client = new BskyServiceWorkerClient(session);
    await client.getMyProfile();
    isValid = true;
  } catch (e) {
    isValid = false;
  }
  debugLog({ isValidSession: isValid });
  return isValid;
};

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { bskyUsers, searchUser, initialize, handleClickAction } =
    useProfileSearch();
  const [isLoading, setIsLoading] = React.useState(false);

  const checkAndAddButton = useDebouncedCallback(async () => {
    const profileService = getProfileService();
    const session = (
      await getChromeStorage(STORAGE_KEYS.BSKY_CLIENT_SESSION)
    )?.[STORAGE_KEYS.BSKY_CLIENT_SESSION];
    const hasSession = !!session;
    if (
      hasSession &&
      profileService.isTargetPage() &&
      !profileService.hasSearchBlueskyButton() &&
      (await hasValidSession(session))
    ) {
      profileService.mountSearchBlueskyButton({
        clickAction: async (userData) => {
          setIsModalOpen(true);
          setIsLoading(true);
          await initialize(session);
          await searchUser(userData);
          setIsLoading(false);
        },
      });
    }
  }, 200);

  useEffect(() => {
    const observer = new MutationObserver(checkAndAddButton);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [checkAndAddButton]);

  return (
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} width={700}>
      <h2 className="text-lg font-bold text-center py-2">
        {chrome.i18n.getMessage("re_search_modal_title")}
      </h2>
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="text-center flex justify-center items-center flex-col gap-4 mt-5">
            <span className="loading loading-spinner loading-lg" />
            <div className="text-center flex justify-center items-center text-sm">
              {chrome.i18n.getMessage("loading")}
            </div>
          </div>
        )}
        {!isLoading && bskyUsers.length > 0 && (
          <div className="flex flex-col gap-2">
            {bskyUsers.map((user) => (
              <div
                className="border-b-[1px] border-gray-500 last:border-b-0"
                key={user.did}
              >
                <ProfileDetectedUserListItem
                  user={user}
                  clickAction={handleClickAction}
                />
              </div>
            ))}
          </div>
        )}
        {!isLoading && bskyUsers.length === 0 && (
          <div className="text-center text-md mt-10">
            😢 {chrome.i18n.getMessage("noUsersFound")}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default Profile;
