import type { AppBskyActorDefs } from "@atproto/api";
import { useEffect, useRef } from "react";

interface TypeaheadDropdownProps {
  suggestions: AppBskyActorDefs.ProfileViewBasic[];
  isSearching: boolean;
  activeIndex: number;
  onSelect: (handle: string) => void;
}

export const TypeaheadDropdown = ({
  suggestions,
  isSearching,
  activeIndex,
  onSelect,
}: TypeaheadDropdownProps) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[activeIndex] as HTMLElement;
      activeItem?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <ul
      ref={listRef}
      className="absolute z-50 top-full left-0 w-full bg-base-200 border border-base-content/20 rounded-lg shadow-lg overflow-y-auto mt-1"
      style={{ maxHeight: "176px" }}
    >
      {isSearching && (
        <li className="px-3 py-3 text-center">
          <span className="loading loading-spinner loading-xs" />
        </li>
      )}
      {!isSearching &&
        suggestions.map((actor, i) => (
          <li
            key={actor.did}
            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
              i === activeIndex
                ? "bg-primary text-primary-content"
                : "hover:bg-base-300"
            }`}
            onMouseDown={() => onSelect(actor.handle)}
          >
            {actor.avatar ? (
              <img
                src={actor.avatar}
                alt=""
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-base-300 flex-shrink-0" />
            )}
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-semibold truncate">
                {actor.displayName || actor.handle}
              </span>
              <span className="text-xs opacity-50 truncate">
                @{actor.handle}
              </span>
            </div>
          </li>
        ))}
      {!isSearching && suggestions.length === 0 && (
        <li className="px-3 py-3 text-xs text-center opacity-60">No results</li>
      )}
    </ul>
  );
};
