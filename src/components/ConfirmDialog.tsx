import { useState } from "react";

export const ConfirmationDialog = ({
  title,
  message,
  open,
  handleConfirm,
  handleCancel,
  cancelText = "Cancel",
  okText = "OK",
}: {
  title?: string;
  message: string;
  open: boolean;
  cancelText?: string;
  okText?: string;
  handleConfirm: () => void;
  handleCancel: () => void;
}) => (
  <dialog id="my_modal_1" className="modal" open={open}>
    <div className="modal-box">
      {title && <h3 className="font-bold text-xl mb-2">{title}</h3>}
      <p className="text-sm">{message}</p>
      <div className="modal-action">
        <form method="dialog">
          <div className="flex gap-2">
            <button
              className="btn btn-neutral btn-sm min-w-24"
              type="button"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
            <button
              className="btn btn-primary btn-sm min-w-24"
              type="button"
              onClick={handleConfirm}
            >
              {okText}
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>
);

const useConfirm = ({
  title = "Confirm",
  message = "Are you sure you want to proceed?",
  cancelText = "Cancel",
  okText = "OK",
}: {
  title?: string;
  message?: string;
  cancelText?: string;
  okText?: string;
}) => {
  const [promise, setPromise] = useState(null);

  const confirm = () => {
    return new Promise((resolve, reject) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  return {
    ConfirmationDialog: () => (
      <ConfirmationDialog
        title={title}
        message={message}
        open={promise !== null}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        cancelText={cancelText}
        okText={okText}
      />
    ),
    confirm,
  };
};

export default useConfirm;
