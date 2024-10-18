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
    searching,
    autoFollowing,
    actionMode,
    errorMessage,
    restart,
    isRateLimitError,
    isSucceeded,
    matchTypeFilter,
    changeMatchTypeFilter,
    filteredUsers,
    loadTwitterFollowing,
    searchBlueskyUsers,
    autoFollowUsers,
    exportResults,
    importResults,
    detectedXUsers,
  } = useRetrieveBskyUsers();

  React.useEffect(() => {
    const messageHandler = (
      message: {
        name: (typeof MESSAGE_NAMES)[keyof typeof MESSAGE_NAMES];
        body: {
          identifier: string;
          password: string;
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
      <Modal anchorRef={modalRef}>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Find and Auto-Follow Bluesky Users</h1>
            <div className="flex gap-3 items-center">
              <p className="text-sm">Detected X Users:</p>
              <p className="font-bold text-xl">{detectedXUsers.length}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`} 
              onClick={() => loadTwitterFollowing(MESSAGE_NAME_TO_QUERY_PARAM_MAP[retrievalParams.messageName])}
              disabled={loading}
            >
              {loading ? 'Loading X Following' : 'Load X Following'}
            </button>
            <button 
              className={`btn btn-secondary ${searching ? 'loading' : ''}`} 
              onClick={searchBlueskyUsers}
              disabled={searching || detectedXUsers.length === 0}
            >
              {searching ? 'Searching Bluesky' : 'Search Bluesky Users'}
            </button>
            <button 
              className={`btn btn-accent ${autoFollowing ? 'loading' : ''}`} 
              onClick={autoFollowUsers}
              disabled={autoFollowing || users.length === 0}
            >
              {autoFollowing ? 'Auto-Following' : 'Auto-Follow Users'}
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={exportResults}>
              Export Results
            </button>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files) {
                  importResults(e.target.files[0]);
                }
              }}
              className="file-input file-input-bordered w-full max-w-xs"
            />
          </div>
          <MatchTypeFilter
            value={matchTypeFilter}
            onChange={changeMatchTypeFilter}
          />
          {isSucceeded && (
            <AlertSuccess>
              <span className="font-bold">{users.length}</span> Bluesky accounts found.
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
                    actionMode={actionMode}
                  />
                ))}
              </div>
            ) : (
              (loading || searching) && <UserCardSkeleton />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default App;
