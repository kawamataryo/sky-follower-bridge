import React from "react";
import type { MatchType, MatchTypeFilterValue } from "../../types";
import {
  ACTION_MODE,
  BSKY_USER_MATCH_TYPE,
  MATCH_TYPE_LABEL_AND_COLOR,
} from "../constants";
import AsyncButton from "./AsyncButton";
import SocialLinks from "./SocialLinks";

type Props = {
  detectedCount: number;
  filterValue: MatchTypeFilterValue;
  onChangeFilter: (key: MatchType) => void;
  actionAll: () => Promise<void>;
  actionMode: (typeof ACTION_MODE)[keyof typeof ACTION_MODE];
  matchTypeStats: Record<Exclude<MatchType, "none">, number>;
};

const Sidebar = ({
  detectedCount,
  filterValue,
  onChangeFilter,
  actionAll,
  actionMode,
  matchTypeStats,
}: Props) => {
  return (
    <aside className="bg-base-300 w-80 min-h-screen p-4 border-r border-base-300 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center gap-2">
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
          <span className="text-2xl font-bold">Sky Follower Bridge</span>
        </div>
        <div className="divider" />
        <div className="flex items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>

          <p className="text-xl font-bold">Detected</p>
        </div>
        <div className="flex items-end mb mb-2">
          <div className="flex gap-3 items-center justify-between">
            <p className="font-bold text-2xl">{detectedCount}</p>
            <p className="text-sm">users</p>
          </div>
        </div>
        <div className="flex gap-2 flex-col">
          {Object.keys(matchTypeStats).map((key) => (
            <div
              className={`badge badge-outline badge-${MATCH_TYPE_LABEL_AND_COLOR[key].color}`}
              key={key}
            >
              {MATCH_TYPE_LABEL_AND_COLOR[key].label}:
              <span className="font-bold text-sm ml-1">
                {matchTypeStats[key]}
              </span>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="flex items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          <p className="text-xl font-bold">Filter</p>
        </div>
        {Object.keys(filterValue).map((key: MatchType) => (
          <div className="form-control" key={key}>
            <label htmlFor={key} className="label cursor-pointer">
              <span className="text-sm">
                {key === BSKY_USER_MATCH_TYPE.FOLLOWING &&
                actionMode === ACTION_MODE.BLOCK
                  ? "Blocked users"
                  : MATCH_TYPE_LABEL_AND_COLOR[key].label}
              </span>
              <input
                type="checkbox"
                id={key}
                checked={filterValue[key]}
                onChange={() => onChangeFilter(key)}
                className="checkbox checkbox-primary checkbox-sm"
              />
            </label>
          </div>
        ))}
        <div className="divider" />
        <div className="flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
            />
          </svg>
          <p className="text-xl font-bold">Action</p>
        </div>
        <AsyncButton
          onClick={actionAll}
          label={actionMode === ACTION_MODE.FOLLOW ? "Follow All" : "Block All"}
        />
        <p className="text-xs">
          ⚠️ User detection is not perfect and may include false positives.
        </p>
      </div>
      <div className="mt-auto">
        <div className="divider" />
        <p className="mb-2">
          If you find this tool helpful, I'd appreciate{" "}
          <a href="https://ko-fi.com/X8X315UWFN" className="link">
            your support
          </a>{" "}
          to help me maintain and improve it ☕
        </p>
        <a
          href="https://ko-fi.com/X8X315UWFN"
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-block" }}
          className="w-full"
        >
          <img
            height={36}
            src="https://storage.ko-fi.com/cdn/kofi1.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
            className="w-[110px] h-auto m-auto"
          />
        </a>
        <div className="divider" />
        <SocialLinks />
      </div>
    </aside>
  );
};

export default Sidebar;
