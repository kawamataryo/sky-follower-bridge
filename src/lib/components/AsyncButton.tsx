import React from "react";

type Props = {
  onClick: () => Promise<void>;
  label: string;
};

const AsyncButton = ({ onClick, label }: Props) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <button
      type="button"
      className="btn btn-primary btn-wide btn-sm mb-2"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Processing..." : label}
    </button>
  );
};

export default AsyncButton;
