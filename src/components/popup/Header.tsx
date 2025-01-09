import packageJson from "../../../package.json";

interface HeaderProps {
  version: string;
}

export const Header = ({ version }: HeaderProps) => {
  return (
    <h1 className="text-primary dark:text-white text-2xl font-thin flex gap-2 items-center">
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="4"
        >
          <path
            strokeLinecap="round"
            d="M36 8H13c-3 0-9 2-9 8s6 8 9 8h22c3 0 9 2 9 8s-6 8-9 8H12"
          />
          <path d="M40 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM8 44a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z" />
        </g>
      </svg>
      Sky Follower Bridge <span className="text-sm self-end">v{version}</span>
    </h1>
  );
};
