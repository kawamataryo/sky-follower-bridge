const UserCardSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="card-body relative py-5 px-5 rounded-sm grid grid-cols-[70px_1fr]">
        <div>
          <div className="avatar">
            <div className="w-14 h-14 rounded-full bg-gray-400" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <span className="rounded-xl bg-gray-400 w-40 h-4 block" />
            <span className="rounded-xl bg-gray-400 w-20 h-2 mt-1 block" />
          </div>
          <p className="flex flex-col gap-1 mt-2">
            <span className="rounded-xl bg-gray-400 w-[90%] h-2 block" />
            <span className="rounded-xl bg-gray-400 w-[80%] h-2 block" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCardSkeleton;
