<script setup lang="ts">

defineProps<{
  title: string;
  moreLabel: string;
}>()

type Voice = {
  name: string;
  handle: string;
  url: string;
  avatarUrl: string;
  content: string;
}

const voices: Voice[] = [
  {
    name: 'Bluesky',
    handle: '@bluesky.app',
    url: 'https://bsky.app/profile/bsky.app/post/3l6ovkgqtqj2o',
    avatarUrl: '/avatars/bsky-app.jpg',
    content: 'Want to find your friends from other networks? Check out the Sky Follower Bridge Chrome extension built by an independent developer!',
  },
  {
    name: 'Ellen Kushner',
    handle: '@ellenkushner.bsky.social',
    url: 'https://bsky.app/profile/ellenkushner.bsky.social/post/3lbqr5klsn222',
    avatarUrl: '/avatars/ellenkushner.jpg',
    content: 'If you\'re migrating from Twitter, there are a couple of useful apps: BlueArk will copy all your tweets into your BlueSky profile and backdate them, and Sky Follower Bridge will find most of your Twitter follows/followers on Bluesky.',
  },
  {
    name: 'David Garton',
    handle: '@dave-garton.bsky.social',
    url: 'https://bsky.app/profile/dave-garton.bsky.social/post/3lb2ceqi4h22x',
    avatarUrl: '/avatars/dave-garton.jpg',
    content: 'just using Sky Follower bridge to find all my followers/following from the other place (found over 3000!)',
  },
  {
    name: 'Gergely Orosz',
    handle: '@gergely.pragmaticengineer.com',
    url: 'https://bsky.app/profile/gergely.pragmaticengineer.com/post/3lb5ndk2qgs2z',
    avatarUrl: '/avatars/gergely.jpg',
    content: 'This is pretty incredible: almost half of the people I follow on Twitter/X are already here, on Bluesky! (I follow ~2,100 people there) Found using the Sky Follower Bridge extension, and (re-) followed them all.',
  },
  {
    name: 'Karen James',
    handle: '@kejames.bsky.social',
    url: 'https://bsky.app/profile/kejames.bsky.social/post/3ldh5mltb3s2z',
    avatarUrl: '/avatars/kejames.jpg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `PSA: You need to run Sky Follower Bridge repeatedly to find the people who joined Bluesky since you last ran it. I do it about once a week. `
  },
  {
    name: 'Alejandro Salamanca',
    handle: '@desvelandooriente.com',
    url: 'https://bsky.app/profile/desvelandooriente.com/post/3lbxfydviuk2x',
    avatarUrl: '/avatars/desvelandooriente.jpg',
    content: 'Me vine a esta red hace un año y pico y me faltaban muchas de las cuentas que seguía en Tuiter. Ya he encontrado a muchas (815 de 2.600 cuentas que seguía, casi un tercio) gracias a la extensión de Firefox "Sky Follower Bridge" desarrollada por @kawamataryo.bsky.social Una herramienta muy útil.',
  },
  {
    name: 'Daniël Verlaan',
    handle: '@daniel.verlaan.xyz',
    url: 'https://bsky.app/profile/daniel.verlaan.xyz/post/3lbhrxvpz5k2z',
    avatarUrl: '/avatars/daniel-verlaan.jpg',
    content: 'Tip: met Sky Follower Bridge kun je zien wie er van X al op Bluesky zit, en kan je ze automatisch volgen. De tool werkt voor zowel degenen die je op X volgt, of degenen die je op X volgen. Handig!',
  },
  {
    name: 'Molly White',
    handle: '@molly.wiki',
    url: 'https://bsky.app/profile/molly.wiki/post/3laonwzwhss2o',
    avatarUrl: '/avatars/molly-white.jpg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `if you’re trying to find the people you follow on twitter, check out @kawamataryo.bsky.social’s www.sky-follower-bridge.dev. it found a full 1/3 of the people i follow. impressive work by the developer, but also impressive to see that that many twitter people are setting up here.`
  },
  {
    name: 'Kyle Chayka',
    handle: '@chaykak.bsky.social',
    url: 'https://bsky.app/profile/chaykak.bsky.social/post/3lbadoatvbc2f',
    avatarUrl: '/avatars/chaykak.jpg',
    content: `This "Sky Follower Bridge" is really handy for porting your twitter follows over, just used it chromewebstore.google.com/detail/sky-follower-bridge/...`
  },
  {
    name: 'Nesskain',
    handle: '@nesskain.bsky.social',
    url: 'https://bsky.app/profile/nesskain.bsky.social/post/3lcvtq64yhc2j',
    avatarUrl: '/avatars/nesskain.jpg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `Thank you guys for recommending Sky Follower Bridge! I build back half of the people I was following on twitter, I feel more comfortable completely switching to Bluesky over the next following weeks... I mean... I stopped using X already when you see how junky it became...`
  },
  {
    name: 'Catherynne M. Valente',
    handle: '@catvalente.bsky.social',
    url: 'https://bsky.app/profile/catvalente.bsky.social/post/3lbfjffeq522q',
    avatarUrl: '/avatars/catvalente.jpg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `On a rec from another BSkyer, I just used the Sky Follower Bridge to import my Twitter follows.I was following 1200 there, it found 500 here & added them.PRETTY AWESOME.`
  }
].map(voice => ({
  ...voice,
  content: voice.content.replace(/sky follower bridge/gi, '<span class="highlight-word">Sky Follower Bridge</span>').replace(/sky-follower-bridge/gi, '<span class="highlight-word">sky-Follower-bridge</span>')
}));
</script>

<template>
  <h2 class="voices-title">{{ title }}</h2>
  <div class="voices-container">
    <a v-for="voice in voices" :key="voice.handle" class="voice-card" :href="voice.url" target="_blank">
      <div class="voice-card-header">
        <img :src="voice.avatarUrl" alt="voice.name" loading="lazy"/>
        <p class="voice-card-header-name">{{ voice.name }}</p>
        <p class="voice-card-header-handle">{{ voice.handle }}</p>
        <svg xmlns="http://www.w3.org/2000/svg" class="bsky-icon" shape-rendering="geometricPrecision"
          text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
          viewBox="0 0 512 452.263">
          <path fill="#0085FF" fill-rule="nonzero"
            d="M110.983 30.443C169.682 74.656 232.823 164.296 256 212.4v127.056c0-2.705-1.04.351-3.282 6.935-12.094 35.646-59.343 174.777-167.383 63.552-56.888-58.561-30.551-117.119 72.998-134.801-59.239 10.111-125.839-6.6-144.114-72.119C8.958 184.18 0 68.081 0 52.402 0-26.143 68.632-1.454 110.983 30.443zm290.034 0C342.318 74.656 279.177 164.296 256 212.4v127.056c0-2.705 1.04.351 3.282 6.935 12.094 35.646 59.343 174.777 167.383 63.552 56.888-58.561 30.551-117.119-72.998-134.801 59.239 10.111 125.839-6.6 144.114-72.119C503.042 184.18 512 68.081 512 52.402c0-78.545-68.624-53.856-110.983-21.959z" />
        </svg>
      </div>
      <div class="voice-card-content">
        <p v-html="voice.content"></p>
      </div>
    </a>
  </div>
  <div class="more-voices-container">
    <a class="more-button" href="https://bsky.app/search?q=sky+follower+bridge" target="_blank">{{ moreLabel }}</a>
  </div>
</template>

<style scoped>
.voices-container {
  column-count: 1;
  column-gap: 1.5rem;
}

@media (min-width: 640px) {
  .voices-container {
    column-count: 2;
  }
}

@media (min-width: 960px) {
  .voices-container {
    column-count: 3;
  }
}

.voice-card {
  padding: 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 1rem;
  text-decoration: none;
  display: inline-block;
  width: 100%;
  margin-top: 1.5rem;
  color: inherit !important;
  transition: opacity 0.2s ease-in-out;
  transition: 1s box-shadow;
  position: relative;
}

.voice-card-header {
  display: grid;
  grid-template-areas:
    "avatar name"
    "avatar handle";
  grid-template-columns: 60px auto;
  position: relative;
}

.voice-card-header img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  grid-area: avatar;
}

.voice-card-header-name {
  grid-area: name;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.voice-card-header-handle {
  grid-area: handle;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1;
}

.bsky-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
}

.voice-card-content p {
  margin-top: 0.5rem;
  margin-bottom: 0;
  line-height: 1.5;
}

.more-voices-container {
  margin-top: 2rem;
  text-align: center;
}

.more-voices-container a {
  text-decoration: none;
  border: 1px solid var(--vp-c-brand-1);
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
  border-radius: 20px;
  padding: 10px 20px;
  line-height: 38px;
  font-size: 14px;
  transition: background-color 0.2s ease-in-out;
}

.more-voices-container a:hover {
  background-color: var(--vp-c-brand-1);
}

.voices-title {
  margin-top: 5rem;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  border-top: none;
}

:deep(.highlight-word) {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.voice-card:before {
    content: '';
    background: linear-gradient(45deg, #0000ff, #0040ff, #0080ff, #00bfff, #00ffff, #00bfff, #0080ff, #0040ff, #0000ff);
    position: absolute;
    top: -2px;
    left:-2px;
    background-size: 400%;
    z-index: -1;
    filter: blur(5px);
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    animation: glowing 20s linear infinite;
    opacity: 0;
    transition: opacity .3s ease-in-out;
    border-radius: 10px;
}

.voice-card:active {
    color: #000
}

.voice-card:active:after {
    background: transparent;
}

.voice-card:hover:before {
    opacity: 1;
}

.voice-card:after {
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: #111;
    left: 0;
    top: 0;
    border-radius: 10px;
}

@keyframes glowing {
    0% { background-position: 0 0; }
    50% { background-position: 400% 0; }
    100% { background-position: 0 0; }
}
</style>
