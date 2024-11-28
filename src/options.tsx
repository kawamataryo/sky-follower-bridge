import UserCard from "~lib/components/UserCard";
import { useBskyUserManager } from "~lib/hooks/useBskyUserManager";
import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import useConfirm from "~lib/components/ConfirmDialog";
import Sidebar from "~lib/components/Sidebar";
import "react-toastify/dist/ReactToastify.css";

const Option = () => {
  const {
    users,
    filteredUsers,
    listName,
    matchTypeFilter,
    changeMatchTypeFilter,
    handleClickAction,
    actionMode,
    actionAll,
    matchTypeStats,
  } = useBskyUserManager();

  const { confirm, ConfirmationDialog } = useConfirm({
    title: "Proceed with Execution?",
    message:
      "User detection is not perfect and may include false positives. Do you still want to proceed?",
    cancelText: "Cancel",
    okText: "OK",
  });

  const handleActionAll = async () => {
    if (!(await confirm())) {
      return;
    }

    const result = await actionAll();
    toast.success(`Followed ${result} users`);
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="fixed top-0 left-0 h-full">
          <Sidebar
            detectedCount={users.length}
            filterValue={matchTypeFilter}
            onChangeFilter={changeMatchTypeFilter}
            actionAll={handleActionAll}
            actionMode={actionMode}
            matchTypeStats={matchTypeStats}
          />
        </div>
        <div className="flex-1 ml-80 p-6 pt-0 overflow-y-auto">
          <div className="grid grid-cols-[22%_1fr] sticky top-0 z-10 bg-base-100 border-b-[1px] border-gray-500">
            <h2 className="text-lg font-bold text-center py-2">Source</h2>
            <h2 className="text-lg font-bold text-center py-2">Detected</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="divide-y divide-gray-500">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.handle}
                  user={user}
                  clickAction={handleClickAction}
                  actionMode={actionMode}
                />
              ))}
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          className="text-sm"
        />
        <ConfirmationDialog />
      </div>
    </>
  );
};

export default Option;
