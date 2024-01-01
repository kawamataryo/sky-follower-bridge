import van from 'vanjs-core'
import { Modal as VanModal } from "vanjs-ui"

const { div, p } = van.tags
export const Modal = () => {
  const closed = van.state(false)

  return VanModal({closed, blurBackground: true}, div({class: ""}, p("Hello, Modal!")))
}
