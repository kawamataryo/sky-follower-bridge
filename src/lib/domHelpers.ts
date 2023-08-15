import type { ProfileView, ViewerState } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export const getUserCells = ({ queryParam, filterInsertedElement }: { queryParam: string, filterInsertedElement: boolean }) => {
  const userCells = document.querySelectorAll(queryParam);

  // filter out already inserted elements
  if (filterInsertedElement) {
    return Array.from(userCells).filter((userCell) => {
      const nextElement = userCell.nextElementSibling
      if (!nextElement) { return true }
      return nextElement.classList.contains("bsky-user-content") === false
    })
  } else {
    return Array.from(userCells)
  }
}

export const insertReloadEl = (clickAction: () => void) => {
  const lastInsertedEl = Array.from(document.querySelectorAll('.bsky-user-content')).at(-1)
  lastInsertedEl.insertAdjacentHTML('afterend', `
  <div class="bsky-reload-btn-wrapper">
    <button class="bsky-reload-btn">
      Find More
    </button>
  </div>
  `)

  const reloadBtn = document.querySelector(".bsky-reload-btn") as HTMLElement
  reloadBtn.addEventListener("click", async (e) => {
    const target = e.target as HTMLButtonElement
    if (target.classList.contains('bsky-reload-btn__processing')) {
      return
    }
    await clickAction()
  })
}

export const removeReloadElIfExists = () => {
  const reloadBtnWrapper = document.querySelector(".bsky-reload-btn-wrapper") as HTMLElement
  reloadBtnWrapper?.remove()
}

export const getAccountNameAndDisplayName = (userCell: Element) => {
  const [avatarEl, displayNameEl] = userCell?.querySelectorAll("a")
  const twAccountName = avatarEl?.getAttribute("href")?.replace("/", "")
  const twDisplayName = displayNameEl?.textContent
  return { twAccountName, twDisplayName }
}
export const insertBskyProfileEl = ({ dom, profile, statusKey, btnLabel, abortController, followAction, unfollowAction }: { dom: Element, profile: ProfileView, statusKey: keyof ViewerState, btnLabel: string, abortController: AbortController, followAction: () => void, unfollowAction: () => void }) => {
  const avatarEl = profile.avatar ? `<img src="${profile.avatar}" width="48" />` : "<div class='no-avatar'></div>"
  const initialUpperLabel = btnLabel.charAt(0).toUpperCase() + btnLabel.slice(1)
  const actionBtnEl = profile.viewer[statusKey] ? `<button class='follow-button follow-button__following'>${initialUpperLabel}ing on Bluesky</button>` : `<button class='follow-button'>${initialUpperLabel} on Bluesky</button>`
  dom.insertAdjacentHTML('afterend', `
  <div class="bsky-user-content">
    <div class="icon-section">
      <a href="https://bsky.app/profile/${profile.handle}" target="_blank" rel="noopener">
        ${avatarEl}
      </a>
    </div>
    <div class="content">
      <div class="name-and-controller">
        <div>
          <p class="display-name"><a href="https://bsky.app/profile/${profile.handle}" target="_blank" rel="noopener">${profile.displayName ?? profile.handle}</a></p>
          <p class="handle">@${profile.handle}</p>
        </div>
        <div>
          ${actionBtnEl}
        </div>
      </div>
      ${profile.description ? `<p class="description">${profile.description}</p>` : ""}
    </div>
  </div>
  `)
  const bskyUserContentDom = dom.nextElementSibling as Element

  // register a click action
  bskyUserContentDom?.addEventListener('click', async (e) => {
    const target = e.target as Element
    const classList = target.classList

    // follow action
    if (classList.contains('follow-button') && !classList.contains('follow-button__following')) {
      target.textContent = "processing..."
      target.classList.add('follow-button__processing')
      await followAction()
      target.textContent = `${initialUpperLabel}ing on Bluesky`
      target.classList.remove('follow-button__processing')
      target.classList.add('follow-button__following')
      target.classList.add('follow-button__just-followed')
      return
    }

    // unfollow action
    if (classList.contains('follow-button') && classList.contains('follow-button__following')) {
      target.textContent = "processing..."
      target.classList.add('follow-button__processing')
      await unfollowAction()
      target.textContent = `${initialUpperLabel} on Bluesky`
      target.classList.remove('follow-button__processing')
      target.classList.remove('follow-button__following')
      return
    }
  }, {
    signal: abortController.signal
  })

  bskyUserContentDom?.addEventListener('mouseover', async (e) => {
    const target = e.target as Element
    const classList = target.classList
    if (classList.contains('follow-button') && classList.contains('follow-button__following')) {
      target.textContent = `Un${btnLabel} on Bluesky`
    }
  }, {
    signal: abortController.signal
  })
  bskyUserContentDom?.addEventListener('mouseout', async (e) => {
    const target = e.target as Element
    const classList = target.classList
    if(classList.contains('follow-button__just-followed')) {
      target.classList.remove('follow-button__just-followed')
    }
    if (classList.contains('follow-button') && classList.contains('follow-button__following')) {
      target.textContent = `${initialUpperLabel}ing on Bluesky`
    }
  }, {
    signal: abortController.signal
  })
}

export const insertNotFoundEl = (dom: Element) => {
  dom.insertAdjacentHTML('afterend', `
  <div class="bsky-user-content bsky-user-content__not-found">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
    <p class="not-found">No similar users found.</p>
  </div>
  `)
}

export const cleanBskyUserElements = () => {
  const bskyUserContent = document.querySelectorAll('.bsky-user-content');
  if (bskyUserContent.length > 0) {
    bskyUserContent.forEach((el) => {
      el.remove()
    })
  }
}

export const isOutOfTopViewport = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return rect.top < 0
}
