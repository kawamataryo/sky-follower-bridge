const UserCardSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="card-body relative py-5 px-5 rounded-sm grid grid-cols-[70px_1fr]">
        <div>
          <div className="avatar">
            <div className="w-14 h-14 rounded-full bg-gray-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <span
              className="rounded-xl bg-gray-400 h-4 block"
              style={{ width: `${Math.floor(Math.random() * 20 + 30)}%` }}
            />
          </div>
          <p className="flex flex-col gap-1 mt-2">
            <span
              className="rounded-xl bg-gray-400 h-2 block"
              style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
            />
            <span
              className="rounded-xl bg-gray-400 h-2 block"
              style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
            />
            <span
              className="rounded-xl bg-gray-400 h-2 block"
              style={{ width: `${Math.floor(Math.random() * 40 + 50)}%` }}
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCardSkeleton;
