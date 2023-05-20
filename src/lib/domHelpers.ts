import type { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

export const getUserCells = ({ filterInsertedElement }: { filterInsertedElement: boolean } = { filterInsertedElement: true }) => {
  const userCells = document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="UserCell"]');

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
export const insertBskyProfileEl = ({ dom, profile, abortController, clickAction }: { dom: Element, profile: ProfileView, abortController: AbortController, clickAction: () => void }) => {
  const avatarEl = profile.avatar ? `<img src="${profile.avatar}" width="48" />` : "<div class='no-avatar'></div>"
  const followButtonEl = profile.viewer?.following ? "<button class='follow-button follow-button__following'>Following on Bluesky</button>" : "<button class='follow-button'>Follow on Bluesky</button>"
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
          ${followButtonEl}
        </div>
      </div>
      ${profile.description ? `<p class="description">${profile.description}</p>` : ""}
    </div>
    <simple-greeting></simple-greeting>
  </div>
  `)
  dom.nextElementSibling?.addEventListener('click', async (e) => {
    // TODO: Add unfollow action
    const target = e.target as Element
    const classList = target.classList
    if (classList.contains('follow-button') && !classList.contains('follow-button__following')) {
      target.textContent = "processing..."
      target.classList.add('follow-button__processing')
      await clickAction()
      target.textContent = "Following on Bluesky"
      target.classList.remove('follow-button__processing')
      target.classList.add('follow-button__following')
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
