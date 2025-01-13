import cssText from "data-text:~style.content.css";
import { sendToBackground } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import type { PlasmoCSConfig } from "plasmo";
import React, { useEffect } from "react";
import { match } from "ts-pattern";
import AlertError from "~components/AlertError";
import LoadingCards from "~components/LoadingCards";
import Modal from "~components/Modal";
import { useRetrieveBskyUsers } from "~hooks/useRetrieveBskyUsers";
import { MESSAGE_NAMES, SERVICE_TYPE, STORAGE_KEYS } from "~lib/constants";

export const config: PlasmoCSConfig = {
  matches: [
    "https://twitter.com/*",
    "https://x.com/*",
  ],
  all_frames: true,
};

export const getStyle = () => {
  const style = document.createElement("style");
  // patch for shadow dom
  style.textContent = cssText.replaceAll(":root", ":host");
  return style;
};

const Profile = () => {
  useEffect(() => {
    const checkAndAddButton = () => {
      console.log("checkAndAddButton");
      const userNameElement = document.querySelector('[data-testid="UserName"]');
      if (userNameElement && !document.getElementById("bsky-search-button")) {
        const button = document.createElement("button");
        button.id = "bsky-search-button";
        button.textContent = "🦋 Search Bluesky";
        button.style.backgroundColor = "#000000";
        button.style.color = "#ffffff";
        button.style.borderRadius = "9999px";
        button.style.padding = "4px 8px";
        button.style.fontWeight = "bold";
        button.style.width = "fit-content";
        button.style.cursor = "pointer";
        button.onclick = () => {
          // ボタンがクリックされたときの処理をここに追加
          console.log("Search Bluesky User button clicked");
        };
        userNameElement.parentElement.insertBefore(button, userNameElement);
      }
    };

    const observer = new MutationObserver(checkAndAddButton);
    observer.observe(document.body, { childList: true, subtree: true });

    // 初期チェック
    checkAndAddButton();

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <p>Profile</p>
    </div>
  );
};

export default Profile;
