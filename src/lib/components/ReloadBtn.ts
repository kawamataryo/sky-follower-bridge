import van from "vanjs-core"

const { button, div } = van.tags

export const ReloadButton = ({clickAction}: {clickAction: () => void}) => {
  const deleted = van.state(false)

  return () => deleted.val ? null : div({ class: "bsky-reload-btn-wrapper" },
  button(
    {
      class: "bsky-reload-btn bsky-fade-in",
      onclick: () => {
        clickAction()
        deleted.val = true
      }
    },
    "Find More"
  ))
}
