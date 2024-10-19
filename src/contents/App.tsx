import cssText from "data-text:~style.content.css";
import type { PlasmoCSConfig } from "plasmo";
import React from "react";
import AlertError from "~lib/components/AlertError";
import AlertSuccess from "~lib/components/AlertSuccess";
import MatchTypeFilter from "~lib/components/MatchTypeFilter";
import Modal from "~lib/components/Modal";
import UserCard from "~lib/components/UserCard";
import UserCardSkeleton from "~lib/components/UserCardSkeleton";
import { MESSAGE_NAMES } from "~lib/constants";
import { useRetrieveBskyUsers } from "~lib/hooks/useRetrieveBskyUsers";

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

const App = () => {
  const {
    initialize,
    modalRef,
    users,
    loading,
    handleClickAction,
    actionMode,
    errorMessage,
    restart,
    isRateLimitError,
    isSucceeded,
    matchTypeFilter,
    changeMatchTypeFilter,
    filteredUsers,
    stopRetrieveLoop,
  } = useRetrieveBskyUsers();

  React.useEffect(() => {
    const messageHandler = (
      message: {
        name: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
        body: {
          identifier: string;
          password: string;
          authFactorToken?: string;
        };
      },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: Record<string, unknown>) => void,
    ) => {
      if (Object.values(MESSAGE_NAMES).includes(message.name)) {
        initialize({
          identifier: message.body.identifier,
          password: message.body.password,
          messageName: message.name,
          ...(message.body.authFactorToken && {
            authFactorToken: message.body.authFactorToken,
          }),
        })
          .then(() => {
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

  return (
    <>
      <Modal anchorRef={modalRef} onClose={stopRetrieveLoop}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Find Bluesky Users</h1>
            <div className="flex gap-3 items-center">
              {loading && (
                <p className="loading loading-spinner loading-md text-primary" />
              )}
              <p className="text-sm">Detected:</p>
              <p className="font-bold text-xl">{users.length}</p>
            </div>
          </div>
          <MatchTypeFilter
            value={matchTypeFilter}
            onChange={changeMatchTypeFilter}
          />
          {isSucceeded && (
            <AlertSuccess>
              <span className="font-bold">{users.length}</span> Bluesky accounts
              detected.
            </AlertSuccess>
          )}
          {errorMessage && (
            <AlertError retryAction={isRateLimitError ? restart : undefined}>
              {errorMessage}
            </AlertError>
          )}
          <div className="flex flex-col gap-4 overflow-scroll max-h-[60vh]">
            {filteredUsers.length > 0 ? (
              <div className="">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.handle}
                    user={user}
                    clickAction={handleClickAction}
                    actionMode={actionMode}
                  />
                ))}
              </div>
            ) : (
              loading && <UserCardSkeleton />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default App;
