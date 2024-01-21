import type { Meta, StoryObj } from "@storybook/react";

import { useRef } from "react";
import BlueskyIconSvg from "./Icons/BlueskyIconSvg";
import Modal from "./Modal";
import UserCard, { type Props as UserCardProps } from "./UserCard";

const meta: Meta<typeof UserCard> = {
  title: "CSUI/Modal",
  component: UserCard,
};
export default meta;

type Story = StoryObj<{ items: UserCardProps["user"][] }>;

const DefaultTemplate: Story = {
  render: () => {
    const modalRef = useRef<HTMLDialogElement>(null);

    return (
      <>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => modalRef.current?.showModal()}
        >
          open
        </button>
        <Modal anchorRef={modalRef}>
          <p>Modal content</p>
        </Modal>
      </>
    );
  },
};

const ShowModalTemplate: Story = {
  render: () => {
    const modalRef = useRef<HTMLDialogElement>(null);

    return (
      <>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => modalRef.current?.showModal()}
        >
          open
        </button>
        <Modal anchorRef={modalRef} open>
          <div className="flex justify-between">
            <h1 className="text-xl font-bold">🔎 Find Bluesky Users</h1>
            <div className="text-xl">34 / 160</div>
          </div>
          <div className="flex gap-1 items-center mt-3">
            <p className="">Match type: </p>
            <div className="badge badge-info">Same handle name</div>
            <div className="badge badge-warning">Same display name</div>
            <div className="badge badge-secondary">
              Included handle name in description
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const Default = {
  ...DefaultTemplate,
};

export const ShowModal = {
  ...ShowModalTemplate,
};
