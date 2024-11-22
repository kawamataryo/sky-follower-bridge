import cssText from "data-text:~style.content.css";
import { sendToBackground } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import type { PlasmoCSConfig } from "plasmo";
import React from "react";
import { match } from "ts-pattern";
import AlertError from "~lib/components/AlertError";
import LoadingCards from "~lib/components/LoadingCards";
import Modal from "~lib/components/Modal";
import { MESSAGE_NAMES, SERVICE_TYPE, STORAGE_KEYS } from "~lib/constants";
import { useRetrieveBskyUsers } from "~lib/hooks/useRetrieveBskyUsers";

export const config: PlasmoCSConfig = {
  matches: [
    "https://twitter.com/*",
    "https://x.com/*",
    "https://www.threads.net/*",
  ],
  all_frames: true,
};

export const getStyle = () => {
  const style = document.createElement("style");
  // patch for shadow dom
  style.textContent = cssText.replaceAll(":root", ":host");
  return style;
};

const App = () => {
  const {
    initialize,
    users,
    loading,
    stopRetrieveLoop,
    restart,
    isBottomReached,
    errorMessage,
    currentService,
  } = useRetrieveBskyUsers();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
    stopRetrieveLoop();
  };

  React.useEffect(() => {
    const messageHandler = (
      message: {
        name: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
      },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: Record<string, unknown>) => void,
    ) => {
      if (Object.values(MESSAGE_NAMES).includes(message.name)) {
        initialize()
          .then(() => {
            setIsModalOpen(true);
            sendResponse({ hasError: false });
          })
          .catch((e) => {
            console.error(e);
            sendResponse({ hasError: true, message: e.toString() });
          });
        return true;
      }
      return false;
    };

    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [initialize]);

  const [_, setKey] = useStorage<string>(
    {
      key: STORAGE_KEYS.RENDER_KEY,
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? "" : v),
  );

  const openOptionPage = () => {
    sendToBackground({ name: "openOptionPage" });
    // force re-render option page
    setKey(Date.now().toString());
  };

  const stopAndShowDetectedUsers = () => {
    openOptionPage();
    stopRetrieveLoop();
  };

  const serviceName = React.useMemo(() => {
    return match(currentService)
      .with(SERVICE_TYPE.X, () => "X")
      .with(SERVICE_TYPE.THREADS, () => "Threads")
      .exhaustive();
  }, [currentService]);

  return (
    <>
      <Modal open={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col gap-2 items-center">
          {loading && (
            <p className="text-lg font-bold">
              Scanning {serviceName} users to find bsky users...
            </p>
          )}
          <p className="text-2xl font-bold">
            Detected <span className="text-4xl">{users.length}</span> users
          </p>
          {errorMessage && <AlertError>{errorMessage}</AlertError>}
          {loading && (
            <>
              <button
                type="button"
                className="btn btn-primary mt-5 btn-ghost"
                onClick={stopAndShowDetectedUsers}
              >
                Stop Scanning and View Results
              </button>
              <LoadingCards />
            </>
          )}
          {!loading && !isBottomReached && (
            <button
              type="button"
              className="btn btn-primary mt-5"
              onClick={restart}
            >
              Resume Scanning
            </button>
          )}
          {!loading && isBottomReached && (
            <div className="flex flex-col gap-2 items-center">
              <button
                type="button"
                className="btn btn-primary mt-5"
                onClick={openOptionPage}
              >
                View Detected Users
              </button>
              <button
                type="button"
                className="btn btn-primary mt-5 btn-ghost"
                onClick={restart}
              >
                Resume Scanning
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default App;
