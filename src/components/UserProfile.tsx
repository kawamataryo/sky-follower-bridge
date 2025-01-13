import React from "react";
import AvatarFallbackSvg from "./Icons/AvatarFallbackSvg";

type UserProfileProps = {
  avatar: string;
  url?: string;
};

export const UserProfile = ({ avatar, url }: UserProfileProps) => (
  <div className="avatar">
    <div className="w-10 h-10 rounded-full border border-white">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {avatar ? <img src={avatar} alt="" /> : <AvatarFallbackSvg />}
        </a>
      ) : (
        <div className="w-10 h-10 rounded-full border border-white">
          {avatar ? <img src={avatar} alt="" /> : <AvatarFallbackSvg />}
        </div>
      )}
    </div>
  </div>
);

export default UserProfile;
