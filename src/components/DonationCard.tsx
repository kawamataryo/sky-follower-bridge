import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { STORAGE_KEYS } from "~lib/constants";
import { getMessageWithLink } from "~lib/utils";

const DonationCard = () => {
  const [userClosed, setUserClosed] = useStorage<boolean>(
    {
      key: STORAGE_KEYS.DONATION_CARD_USER_CLOSED,
      instance: new Storage({
        area: "local",
      }),
    },
    false,
  );

  const handleClose = () => {
    setIsVisible(false);
  };
  const handleDonationLinkClick = () => {
    setUserClosed(true);
    setIsVisible(false);
    window.open("https://ko-fi.com/kawamataryo", "_blank");
  };

  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const showDonationCard = () => {
      if (userClosed) return;
      setIsVisible(true);
    };
    const timeoutId = setTimeout(showDonationCard, 4000);
    return () => clearTimeout(timeoutId);
  }, [userClosed]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="card bg-neutral text-neutral-content shadow-lg w-[426px] relative"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
          >
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div className="card-body p-4 cursor-pointer" onClick={handleClose}>
              <div className="flex gap-2 items-center">
                <p
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: getMessageWithLink("donate_message"),
                  }}
                />
                <button
                  type="button"
                  onClick={handleDonationLinkClick}
                  style={{ display: "inline-block" }}
                  className="w-full"
                >
                  <img
                    src="https://storage.ko-fi.com/cdn/kofi1.png?v=6"
                    alt="Buy Me a Coffee at ko-fi.com"
                    className="w-[120px] h-auto m-auto"
                  />
                </button>
              </div>
            </div>
            <div className="absolute top-[-10px] right-[-10px]">
              <button
                className="btn btn-circle btn-sm bg-neutral text-neutral-content"
                type="button"
                onClick={handleClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(DonationCard);
