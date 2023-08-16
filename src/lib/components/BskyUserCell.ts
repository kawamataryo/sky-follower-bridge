import type { ProfileView, ViewerState } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import van from 'vanjs-core'

const { a, div, p, img, button } = van.tags

export type UserCellBtnLabel = {
  add: string,
  remove: string,
  progressive: string,
}

const ActionButton = ({ statusKey, profile, btnLabel, addAction, removeAction }: {
  profile: ProfileView,
  statusKey: keyof ViewerState,
  btnLabel: UserCellBtnLabel,
  addAction: () => Promise<void>,
  removeAction: () => Promise<void>
}) => {
  const label = van.state(`${profile.viewer[statusKey] ? btnLabel.progressive : btnLabel.add} on Bluesky`)

  const isStateOfBeing = van.state(profile.viewer[statusKey])
  const isProcessing = van.state(false)
  const isJustApplied = van.state(false)

  const beingClass = van.derive(() => isStateOfBeing.val ? "action-button__being" : "")
  const processingClass = van.derive(() => isProcessing.val ? "action-button__processing" : "")
  const justAppliedClass = van.derive(() => isJustApplied.val ? "action-button__just-applied" : "")

  const onClick = async () => {
    if (isProcessing.val) return
    isProcessing.val = true
    label.val = "Processing..."

    if (isStateOfBeing.val) {
      await removeAction()
      label.val = `${btnLabel.add} on Bluesky`
      isStateOfBeing.val = false
    } else {
      await addAction()
      label.val = `${btnLabel.progressive} on Bluesky`
      isStateOfBeing.val = true
      isJustApplied.val = true
    }

    isProcessing.val = false
  }

  const onMouseover = () => {
    if(
      isProcessing.val ||
      isJustApplied.val ||
      !isStateOfBeing.val
    ) return

    label.val = `${btnLabel.remove} on Bluesky`
  }

  const onMouseout = () => {
    if (isJustApplied.val) {
      isJustApplied.val = false
    }
    if(!isStateOfBeing.val) return

    label.val = `${btnLabel.progressive} on Bluesky`
  }

  return () => button({
    class: `action-button ${beingClass.val} ${processingClass.val} ${justAppliedClass.val}`,
    onclick: onClick,
    onmouseover: onMouseover,
    onmouseout: onMouseout,
  },
    label.val,
  )
}

const Avatar = ({ avatar }: { avatar?: string }) => {
  return avatar ? img({ src: avatar, width: "40" }) : div({ class: "no-avatar" })
}

export const BskyUserCell = ({
  profile,
  statusKey,
  btnLabel,
  addAction,
  removeAction,
}: {
  profile: ProfileView,
  statusKey: keyof ViewerState,
  btnLabel: UserCellBtnLabel,
  addAction: () => Promise<void>,
  removeAction: () => Promise<void>
}) => {
  return div({ class: "bsky-user-content" },
    div({ class: "icon-section"},
      a({ href: `https://bsky.app/profile/${profile.handle}`, target: "_blank", rel: "noopener" },
        Avatar({ avatar: profile.avatar }),
      ),
    ),
    div({ class: "content" },
      div({ class: "name-and-controller" },
        div(
          p({ class: "display-name" },
            a({ href: `https://bsky.app/profile/${profile.handle}`, target: "_blank", rel: "noopener" },
              profile.displayName ?? profile.handle,
            ),
          ),
          p({ class: "handle" },
            `@${profile.handle}`,
          ),
        ),
        div(
          ActionButton({
            profile,
            statusKey,
            btnLabel,
            addAction,
            removeAction,
          })
        ),
      ),
      profile.description ? p({ class: "description" }, profile.description) : "",
    ),
  )
}
