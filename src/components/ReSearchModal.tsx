import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import Modal from "~lib/components/Modal";
import UserCardWithoutActionButton from "~lib/components/UserCardWithoutActionButton";

interface ReSearchModalProps {
  open: boolean;
  onClose: () => void;
  reSearchResults: {
    sourceDid: string;
    users: ProfileView[];
  };
  handleClickReSearchResult: ({
    sourceDid,
    user,
  }: {
    sourceDid: string;
    user: ProfileView;
  }) => void;
}

const ReSearchModal: React.FC<ReSearchModalProps> = ({
  open,
  onClose,
  reSearchResults,
  handleClickReSearchResult,
}) => {
  return (
    <Modal open={open} width={600} onClose={onClose}>
      <h2 className="text-lg font-bold text-center py-2">
        {chrome.i18n.getMessage("re_search_modal_title")}
      </h2>
      {reSearchResults.users.length === 0 && (
        <div className="text-center flex justify-center items-center flex-col gap-4 mt-5">
          <span className="loading loading-spinner loading-lg" />
          <div className="text-center flex justify-center items-center text-sm">
            {chrome.i18n.getMessage("loading")}
          </div>
        </div>
      )}
      {reSearchResults.users.length > 0 && (
        <div className="divide-y divide-gray-500">
          {reSearchResults.users.map((user) => (
            <UserCardWithoutActionButton
              key={user.handle}
              onClick={() =>
                handleClickReSearchResult({
                  sourceDid: reSearchResults.sourceDid,
                  user,
                })
              }
              user={{
                avatar: user.avatar,
                handle: user.handle,
                displayName: user.displayName,
                description: user.description,
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ReSearchModal;
