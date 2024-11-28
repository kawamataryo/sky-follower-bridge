import React from "react";

type Props = {
  onClick: () => Promise<void>;
  label: string;
  className?: string;
};

const AsyncButton = ({ onClick, label, className }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <button
      type="button"
      className={`btn btn-primary btn-wide btn-sm mb-2 ${className}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Processing..." : label}
    </button>
  );
};

export default AsyncButton;
