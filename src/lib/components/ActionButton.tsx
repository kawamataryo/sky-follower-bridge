import React from "react";

type ActionButtonProps = {
  loading: boolean;
  actionBtnLabelAndClass: { label: string; class: string };
  handleActionButtonClick: () => void;
  setIsBtnHovered: (value: boolean) => void;
  setIsJustClicked: (value: boolean) => void;
};

export const ActionButton = ({
  loading,
  actionBtnLabelAndClass,
  handleActionButtonClick,
  setIsBtnHovered,
  setIsJustClicked,
}: ActionButtonProps) => (
  <button
    type="button"
    className={`btn btn-sm rounded-3xl ${
      loading ? "" : actionBtnLabelAndClass.class
    }`}
    onClick={handleActionButtonClick}
    onMouseEnter={() => setIsBtnHovered(true)}
    onMouseLeave={() => {
      setIsBtnHovered(false);
      setIsJustClicked(false);
    }}
    disabled={loading}
  >
    {loading ? "Processing..." : actionBtnLabelAndClass.label}
  </button>
);

export default ActionButton;
