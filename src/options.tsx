import UserCard from "~lib/components/UserCard";
import { useBskyUserManager } from "~lib/hooks/useBskyUserManager";
import "./style.css";
import Sidebar from "~lib/components/Sidebar";

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

  const handleActionAll = async () => {
    if (
      !window.confirm(
        "User detection is not perfect and may include false positives. Do you still want to proceed?",
      )
    ) {
      return;
    }

    await actionAll();
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
        <div className="flex-1 ml-80 p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
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
        </div>
      </div>
    </>
  );
};

export default Option;
