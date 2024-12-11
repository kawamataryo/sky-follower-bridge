import { useBskyUserManager } from "~lib/hooks/useBskyUserManager";
import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import useConfirm from "~lib/components/ConfirmDialog";
import Sidebar from "~lib/components/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import ReSearchModal from "~components/ReSearchModal";
import DetectedUserListItem from "~lib/components/DetectedUserListItem";
import DonationCard from "~lib/components/DonationCard";

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
    deleteUser,
  } = useBskyUserManager();

  const {
    confirm: followAllConfirm,
    ConfirmationDialog: FollowAllConfirmationDialog,
  } = useConfirm({
    title: chrome.i18n.getMessage("follow_all_confirmation_title"),
    message: chrome.i18n.getMessage("follow_all_confirmation_message"),
    cancelText: chrome.i18n.getMessage("confirmation_cancel"),
    okText: chrome.i18n.getMessage("confirmation_ok"),
  });

  const {
    confirm: importListConfirm,
    ConfirmationDialog: ImportListConfirmationDialog,
  } = useConfirm({
    title: chrome.i18n.getMessage("import_list_confirmation_title"),
    message: chrome.i18n.getMessage("import_list_confirmation_message"),
    cancelText: chrome.i18n.getMessage("confirmation_cancel"),
    okText: chrome.i18n.getMessage("confirmation_ok"),
  });

  const handleFollowAll = async () => {
    if (!(await followAllConfirm())) {
      return;
    }
    toast.promise(followAll, {
      pending: chrome.i18n.getMessage("toast_pending"),
      success: {
        render({ data }) {
          return (
            <span className="font-bold">
              {chrome.i18n.getMessage("toast_follow_all_success", [
                data.toString(),
              ])}
            </span>
          );
        },
      },
    });
  };

  const handleBlockAll = async () => {
    if (!(await followAllConfirm())) {
      return;
    }
    toast.promise(blockAll, {
      pending: chrome.i18n.getMessage("toast_pending"),
      success: {
        render({ data }) {
          return (
            <span className="font-bold">
              {chrome.i18n.getMessage("toast_block_all_success", [
                data.toString(),
              ])}
            </span>
          );
        },
      },
    });
  };

  const handleImportList = async () => {
    if (!(await importListConfirm())) {
      return;
    }
    toast.promise(importList, {
      pending: chrome.i18n.getMessage("toast_pending"),
      success: {
        render({ data }) {
          return (
            <>
              <span className="font-bold">
                {chrome.i18n.getMessage("toast_import_list_success")}
              </span>
              <br />
              <a href={data} target="_blank" rel="noreferrer" className="link">
                {chrome.i18n.getMessage("toast_import_list_success_view_list")}
              </a>
            </>
          );
        },
      },
      error: {
        render({ data }) {
          return chrome.i18n.getMessage("toast_import_list_error", [
            data as string,
          ]);
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
            <h2 className="text-lg font-bold text-center py-2">
              {chrome.i18n.getMessage("source")}
            </h2>
            <h2 className="text-lg font-bold text-center py-2">
              {chrome.i18n.getMessage("detected")}
            </h2>
          </div>
          <div className="flex flex-col border-b-[1px] border-gray-500">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.did}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DetectedUserListItem
                    key={user.handle}
                    user={user}
                    clickAction={handleClickAction}
                    actionMode={actionMode}
                    reSearch={handleReSearch}
                    deleteUser={deleteUser}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="fixed bottom-5 right-5">
          <DonationCard />
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
