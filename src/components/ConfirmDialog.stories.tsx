import type { Meta, StoryObj } from "@storybook/react";
import useConfirm, { ConfirmationDialog } from "./ConfirmDialog";

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmationDialog,
} satisfies Meta<typeof ConfirmationDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Are you sure you want to proceed?",
    open: false,
    handleConfirm: () => {},
    handleCancel: () => {},
  },
  render: (args) => {
    const { ConfirmationDialog, confirm } = useConfirm({
      message: args.message,
    });

    const handleClick = async () => {
      const result = await confirm();
      alert(`Confirmed: ${result}`);
    };

    return (
      <div>
        <button type="button" onClick={handleClick} className="btn btn-primary">
          Open Confirm Dialog
        </button>
        <ConfirmationDialog />
      </div>
    );
  },
};
