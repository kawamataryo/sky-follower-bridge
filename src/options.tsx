import { useBskyUserManager } from "~lib/hooks/useBskyUserManager";
import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import useConfirm from "~lib/components/ConfirmDialog";
import Sidebar from "~lib/components/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import React from "react";
import ReSearchModal from "~components/ReSearchModal";
import DetectedUserListItem from "~lib/components/DetectedUserListItem";

const Option = () => {
  const {
    users,
    filteredUsers,
    matchTypeFilter,
    changeMatchTypeFilter,
    handleClickAction,
    actionMode,
    matchTypeStats,
    importList,
    followAll,
    blockAll,
    reSearch,
    reSearchResults,
    changeDetectedUser,
    clearReSearchResults,
  } = useBskyUserManager();

  const {
    confirm: followAllConfirm,
    ConfirmationDialog: FollowAllConfirmationDialog,
  } = useConfirm({
    title: "Proceed with Execution?",
    message:
      "User detection is not perfect and may include false positives. Do you still want to proceed?",
    cancelText: "Cancel",
    okText: "OK",
  });

  const {
    confirm: importListConfirm,
    ConfirmationDialog: ImportListConfirmationDialog,
  } = useConfirm({
    title: "Proceed with Execution?",
    message:
      "Importing a list will create a new list and add all detected users to it. This feature is experimental and may not work as expected. Do you still want to proceed?",
    cancelText: "Cancel",
    okText: "OK",
  });

  const handleFollowAll = async () => {
    if (!(await followAllConfirm())) {
      return;
    }
    toast.promise(followAll, {
      pending: "Processing...",
      success: {
        render({ data }) {
          return <span className="font-bold">Followed {data} users🎉</span>;
        },
      },
    });
  };

  const handleBlockAll = async () => {
    if (!(await followAllConfirm())) {
      return;
    }
    toast.promise(blockAll, {
      pending: "Processing...",
      success: {
        render({ data }) {
          return <span className="font-bold">Blocked {data} users🎉</span>;
        },
      },
    });
  };

  const handleImportList = async () => {
    if (!(await importListConfirm())) {
      return;
    }
    toast.promise(importList, {
      pending: "Processing...",
      success: {
        render({ data }) {
          return (
            <>
              <span className="font-bold">List imported successfully🎉</span>
              <br />
              <a href={data} target="_blank" rel="noreferrer" className="link">
                View Imported List
              </a>
            </>
          );
        },
      },
      error: {
        render({ data }) {
          console.log(data);
          return `Failed to import list: ${data}`;
        },
      },
    });
  };

  const [showReSearchModal, setShowReSearchModal] = React.useState(false);
  const handleReSearch = async (user: {
    sourceDid: string;
    accountName: string;
    displayName: string;
  }) => {
    reSearch({
      sourceDid: user.sourceDid,
      accountName: user.accountName,
      displayName: user.displayName,
    });
    setShowReSearchModal(true);
  };

  const handleClickReSearchResult = ({
    sourceDid,
    user,
  }: {
    sourceDid: string;
    user: ProfileView;
  }) => {
    changeDetectedUser(sourceDid, user);
    setShowReSearchModal(false);
    clearReSearchResults();
  };

  const handleCloseReSearchModal = () => {
    setShowReSearchModal(false);
    clearReSearchResults();
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="fixed top-0 left-0 h-full">
          <Sidebar
            detectedCount={users.length}
            filterValue={matchTypeFilter}
            onChangeFilter={changeMatchTypeFilter}
            actionMode={actionMode}
            matchTypeStats={matchTypeStats}
            importList={handleImportList}
            followAll={handleFollowAll}
            blockAll={handleBlockAll}
          />
        </div>
        <div className="flex-1 ml-80 p-6 pt-0 overflow-y-auto">
          <div className="grid grid-cols-[22%_1fr] sticky top-0 z-10 bg-base-100 border-b-[1px] border-gray-500">
            <h2 className="text-lg font-bold text-center py-2">Source</h2>
            <h2 className="text-lg font-bold text-center py-2">Detected</h2>
          </div>
          <div className="flex flex-col border-b-[1px] border-gray-500">
            {filteredUsers.map((user) => (
              <DetectedUserListItem
                key={user.handle}
                user={user}
                clickAction={handleClickAction}
                actionMode={actionMode}
                reSearch={handleReSearch}
              />
            ))}
          </div>
        </div>
        <ReSearchModal
          open={showReSearchModal}
          onClose={handleCloseReSearchModal}
          reSearchResults={reSearchResults}
          handleClickReSearchResult={handleClickReSearchResult}
        />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          className="text-sm"
        />
        <FollowAllConfirmationDialog />
        <ImportListConfirmationDialog />
      </div>
    </>
  );
};

export default Option;
