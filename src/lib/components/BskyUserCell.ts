import type { ProfileView, ViewerState } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { P, match } from "ts-pattern"
import van from 'vanjs-core'
import { BSKY_USER_MATCH_TYPE } from "~lib/constants"


const { a, div, p, img, button, span } = van.tags
const { svg, path } = van.tagsNS("http://www.w3.org/2000/svg")

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
    if (
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
    if (!isStateOfBeing.val) return

    label.val = `${btnLabel.progressive} on Bluesky`
  }

  return button({
    class: () => `action-button ${beingClass.val} ${processingClass.val} ${justAppliedClass.val}`,
    onclick: onClick,
    onmouseover: onMouseover,
    onmouseout: onMouseout,
  },
    () => label.val,
  )
}

const Avatar = ({ avatar }: { avatar?: string }) => {
  return avatar ? img({ src: avatar, width: "40" }) : div({ class: "no-avatar" })
}

const MatchTypeLabel = ({ matchType }: { matchType: typeof BSKY_USER_MATCH_TYPE[keyof typeof BSKY_USER_MATCH_TYPE] }) => {
  const [text, labelClass] = match(matchType)
    .with(
      BSKY_USER_MATCH_TYPE.HANDLE,
      () => ["Same handle name", "match-type__handle"]
    )
    .with(
      BSKY_USER_MATCH_TYPE.DISPLAY_NAME,
      () => ["Same display name", "match-type__display-name"]
    )
    .with(
      BSKY_USER_MATCH_TYPE.DESCRIPTION,
      () => ["Included handle name in description", "match-type__description"]
    )
    .run()

  return div({ class: `match-type ${labelClass}` },
    svg({ fill: "none", width: "12", viewBox: "0 0 24 24", "stroke-width": "3", stroke: "currentColor", class: "w-6 h-6" },
      path({ "stroke-linecap": "round", "stroke-linejoin": "round", "d": "M4.5 12.75l6 6 9-13.5" }),
    ),
    text
  )
}

export const BskyUserCell = ({
  profile,
  statusKey,
  btnLabel,
  matchType,
  addAction,
  removeAction,
}: {
  profile: ProfileView,
  statusKey: keyof ViewerState,
  btnLabel: UserCellBtnLabel,
  matchType: typeof BSKY_USER_MATCH_TYPE[keyof typeof BSKY_USER_MATCH_TYPE],
  addAction: () => Promise<void>,
  removeAction: () => Promise<void>
}) => {
  return div({ class: "bsky-user-content-wrapper" },
    MatchTypeLabel({ matchType }),
    div({ class: "bsky-user-content bsky-fade-in" },
      div({ class: "icon-section" },
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
    ))
}
