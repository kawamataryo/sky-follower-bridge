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
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:z72i7hdynmk6r22z27h6tvur/bafkreihagr2cmvl2jt4mgx3sppwe2it3fwolkrbtjrhcnwjk4jdijhsoze@jpeg',
    content: 'Want to find your friends from other networks? Check out the Sky Follower Bridge Chrome extension built by an independent developer!',
  },
  {
    name: 'Ellen Kushner',
    handle: '@ellenkushner.bsky.social',
    url: 'https://bsky.app/profile/ellenkushner.bsky.social/post/3lbqr5klsn222',
    avatarUrl: 'https://cdn.bsky.app/img/avatar/plain/did:plc:ilnzqg6gvqbxsqyikfmw2n6v/bafkreiew3plr664xaa2hqopglz7ljodsy6j3giq76iom3pfnqfrzonacdm@jpeg',
    content: 'If you\'re migrating from Twitter, there are a couple of useful apps: BlueArk will copy all your tweets into your BlueSky profile and backdate them, and Sky Follower Bridge will find most of your Twitter follows/followers on Bluesky.',
  },
  {
    name: 'David Garton',
    handle: '@dave-garton.bsky.social',
    url: 'https://bsky.app/profile/dave-garton.bsky.social/post/3lb2ceqi4h22x',
    avatarUrl: 'https://cdn.bsky.app/img/avatar/plain/did:plc:xqmxsy4atotuqfwwtkiuphqo/bafkreic4b35hosgey35zp74grtzbcifxjasn43u4wme5ir5kwyf7cq5ceu@jpeg',
    content: 'just using Sky Follower bridge to find all my followers/following from the other place (found over 3000!)',
  },
  {
    name: 'Gergely Orosz',
    handle: '@gergely.pragmaticengineer.com',
    url: 'https://bsky.app/profile/gergely.pragmaticengineer.com/post/3lb5ndk2qgs2z',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:3n5xhy6vl7smssmwxq5wgqa6/bafkreiff6ltslguxeg43g7etxnkhbetuzsvrkxonbpq6cle22k3xmsv5oi@jpeg',
    content: 'This is pretty incredible: almost half of the people I follow on Twitter/X are already here, on Bluesky! (I follow ~2,100 people there) Found using the Sky Follower Bridge extension, and (re-) followed them all.',
  },
  {
    name: 'Prof. Farhana Sultana',
    handle: '@farhanasultana.com',
    url: 'https://bsky.app/profile/farhanasultana.com/post/3ldxbpfdl4k2z',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:lhxnyveivbrnaqrcpx66p4i6/bafkreibjheu3bivxswyjj7slv7csxaohav7qjewetp4pdtjf3ulhjzcq2q@jpeg',
    content: 'I keep forgetting to run the Sky Follower Bridge to find Twitter mutuals who’ve arrived since I last ran it. I’m doing it and have found over 500 new mutuals.😮 Find your Twitter mutuals by using this nifty thing! ',
  },
  {
    name: 'Karen James',
    handle: '@kejames.bsky.social',
    url: 'https://bsky.app/profile/kejames.bsky.social/post/3ldh5mltb3s2z',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:dioczrkhp7ee5n5egow4d5cp/bafkreicuuq3jftts6fkch3mg6ehjhhhfmhvgjkakx5itjnrrdxvsr3hp7y@jpeg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `PSA: You need to run Sky Follower Bridge repeatedly to find the people who joined Bluesky since you last ran it. I do it about once a week. `
  },
  {
    name: 'Alejandro Salamanca',
    handle: '@desvelandooriente.com',
    url: 'https://bsky.app/profile/desvelandooriente.com/post/3lbxfydviuk2x',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:ijiirb35kk5rfavwlieobha6/bafkreih2kj5xlnzcnbexwmysjqt6ztviqhrgqnfnfvku6hrajaggbjusky@jpeg',
    content: 'Me vine a esta red hace un año y pico y me faltaban muchas de las cuentas que seguía en Tuiter. Ya he encontrado a muchas (815 de 2.600 cuentas que seguía, casi un tercio) gracias a la extensión de Firefox "Sky Follower Bridge" desarrollada por @kawamataryo.bsky.social Una herramienta muy útil.',
  },
  {
    name: 'Daniël Verlaan',
    handle: '@daniel.verlaan.xyz',
    url: 'https://bsky.app/profile/daniel.verlaan.xyz/post/3lbhrxvpz5k2z',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:cmac5br66ueymcz6x7vu3f4p/bafkreie2funwofsfirjcb6lw6cyudct75xmeqx6gkka2kwnklki2wxa4ni@jpeg',
    content: 'Tip: met Sky Follower Bridge kun je zien wie er van X al op Bluesky zit, en kan je ze automatisch volgen. De tool werkt voor zowel degenen die je op X volgt, of degenen die je op X volgen. Handig!',
  },
  {
    name: 'Molly White',
    handle: '@molly.wiki',
    url: 'https://bsky.app/profile/molly.wiki/post/3laonwzwhss2o',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:exrxvyu6bpoym6mbnctke5tn/bafkreibiohyczyzxp3auyguy2klhslnv3nqgehpu7daglouztx4zziy2yq@jpeg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `if you’re trying to find the people you follow on twitter, check out @kawamataryo.bsky.social’s www.sky-follower-bridge.dev. it found a full 1/3 of the people i follow. impressive work by the developer, but also impressive to see that that many twitter people are setting up here.`
  },
  {
    name: 'Kyle Chayka',
    handle: '@chaykak.bsky.social',
    url: 'https://bsky.app/profile/chaykak.bsky.social/post/3lbadoatvbc2f',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:bo2bmuqp2gw2me4h4rxmzx5b/bafkreidfaxfqkqwili7ny45ber64b64ototilb2o76aogp7mwcnf567et4@jpeg',
    content: `This "Sky Follower Bridge" is really handy for porting your twitter follows over, just used it chromewebstore.google.com/detail/sky-follower-bridge/...`
  },
  {
    name: 'Nesskain',
    handle: '@nesskain.bsky.social',
    url: 'https://bsky.app/profile/nesskain.bsky.social/post/3lcvtq64yhc2j',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:thaurucesmhg55fu3w42zay6/bafkreigkpfzqlr655za7ku4yrtn7i7puyqfpmrbaprq7jd5qbwdf6nlhja@jpeg',
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    content: `Thank you guys for recommending Sky Follower Bridge! I build back half of the people I was following on twitter, I feel more comfortable completely switching to Bluesky over the next following weeks... I mean... I stopped using X already when you see how junky it became...`
  },
  {
    name: 'Catherynne M. Valente',
    handle: '@catvalente.bsky.social',
    url: 'https://bsky.app/profile/catvalente.bsky.social/post/3lbfjffeq522q',
    avatarUrl: 'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:kfejnqjpa66ioofvqdlq4c6j/bafkreic4uljtbfboklcuoeqleiu5yrbk6bxgjh5ioodejd7efkx2s5ptim@jpeg',
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
    <a v-for="voice in voices" :key="voice.handle" class="voice-card" :href="voice.url">
      <div class="voice-card-header">
        <img :src="voice.avatarUrl" alt="voice.name" />
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
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  text-decoration: none;
  display: inline-block;
  width: 100%;
  margin-top: 1.5rem;
  color: inherit !important;
  transition: opacity 0.2s ease-in-out;
}

.voice-card:hover {
  color: inherit !important;
  opacity: 0.7;
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

::v-deep .highlight-word {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
</style>
