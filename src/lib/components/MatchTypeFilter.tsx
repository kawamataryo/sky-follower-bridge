import React from "react";
import type { MatchType } from "../../types";
import { BSKY_USER_MATCH_TYPE, MATCH_TYPE_LABEL_AND_COLOR } from "../constants";

export type MatchTypeFilterValue = {
  [BSKY_USER_MATCH_TYPE.DESCRIPTION]: boolean;
  [BSKY_USER_MATCH_TYPE.DISPLAY_NAME]: boolean;
  [BSKY_USER_MATCH_TYPE.HANDLE]: boolean;
};

export type props = {
  value: MatchTypeFilterValue;
  onChange: (key: MatchType) => void;
};

const MatchTypeFilter = ({ value, onChange }: props) => {
  return (
    <div className="flex gap-2 items-center">
      {Object.keys(value).map((key: MatchType) => (
        <div className="form-control" key={key}>
          <label
            htmlFor={key}
            className={`badge badge-${
              MATCH_TYPE_LABEL_AND_COLOR[key].color
            } gap-1 cursor-pointer py-3 ${value[key] ? "" : "badge-outline"}`}
          >
            <input
              type="checkbox"
              id={key}
              checked={value[key]}
              onChange={() => onChange(key)}
              className="checkbox checkbox-xs"
            />
            <span className="">{MATCH_TYPE_LABEL_AND_COLOR[key].label}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default MatchTypeFilter;
