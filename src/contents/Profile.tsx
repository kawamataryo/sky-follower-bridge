import cssText from "data-text:~style.content.css";
import type { PlasmoCSConfig } from "plasmo";
import React, { useEffect } from "react";
import Modal from "~components/Modal";
import { ProfileDetectedUserListItem } from "~components/ProfileDetectedUserListItem";
import { useProfileSearch } from "~hooks/useProfileSearch";
import { getChromeStorage } from "~lib/chromeHelper";
import { STORAGE_KEYS } from "~lib/constants";
import { XProfileService } from "~services/xProfileService";

export const config: PlasmoCSConfig = {
  matches: ["https://twitter.com/*", "https://x.com/*"],
  all_frames: true,
};

export const getStyle = () => {
  const style = document.createElement("style");
  // patch for shadow dom
  style.textContent = cssText.replaceAll(":root", ":host");
  return style;
};

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { bskyUsers, searchUser, initialize, handleClickAction } =
    useProfileSearch();
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const profileService = new XProfileService();

    const checkAndAddButton = async () => {
      const session = (
        await getChromeStorage(STORAGE_KEYS.BSKY_CLIENT_SESSION)
      )?.[STORAGE_KEYS.BSKY_CLIENT_SESSION];
      const hasSession = !!session;

      if (
        hasSession &&
        profileService.isTargetPage() &&
        !profileService.hasSearchBlueskyButton()
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
    };

    const observer = new MutationObserver(checkAndAddButton);
    observer.observe(document.body, { childList: true, subtree: true });

    checkAndAddButton();

    return () => {
      observer.disconnect();
    };
  }, [searchUser, initialize]);

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
          <div>😢 {chrome.i18n.getMessage("noUsersFound")}</div>
        )}
      </div>
    </Modal>
  );
};

export default Profile;
