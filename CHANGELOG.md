## [1.0.1](https://github.com/quran-th/quran.in.th/compare/v1.0.0...v1.0.1) (2025-09-29)


### 🐛 Bug Fixes

* resolve R2 bucket writeHttpMetadata type error in audio streaming ([#3](https://github.com/quran-th/quran.in.th/issues/3)) ([7566ff0](https://github.com/quran-th/quran.in.th/commit/7566ff0751483517c2a0e1ca6c96cb05d7dd379a))

## 1.0.0 (2025-09-28)


### 🎉 Features

* add audio player system with composables and services ([494593e](https://github.com/quran-th/quran.in.th/commit/494593ed4c9de4c277f7abdf6dca73e2ba92fb37))
* add basic app structure with UApp wrapper ([0b564cb](https://github.com/quran-th/quran.in.th/commit/0b564cb47918e5a1cd9e2d3ab829e7e8cd05e71e))
* add public assets and PWA support ([633a634](https://github.com/quran-th/quran.in.th/commit/633a63414365d447ba15a234f4088996c5379357))
* add Quran data files and reciter information ([91bf3a8](https://github.com/quran-th/quran.in.th/commit/91bf3a8578087bcff7a75ca44c9e6d14a05a2526))
* add ReciterInfoCard component ([a842bf4](https://github.com/quran-th/quran.in.th/commit/a842bf49f0274a329efb52639e1512f2fab54c8d))
* add server-side audio API and middleware ([433315e](https://github.com/quran-th/quran.in.th/commit/433315eb54b759303bc6af8f829f758bce9fbd95))
* clean up unused code and fix mobile UI layout ([867dd4a](https://github.com/quran-th/quran.in.th/commit/867dd4ac0eedd4b750d47850a2f6917aad3023d3))
* handling audio error ([9001c18](https://github.com/quran-th/quran.in.th/commit/9001c18a7711ab52606eda74029aad8b1bbfcf63))
* icon manifest ([f640414](https://github.com/quran-th/quran.in.th/commit/f64041421b296229f83133504b80e06af84c3089))
* implement complete Quran player interface ([bfcc646](https://github.com/quran-th/quran.in.th/commit/bfcc6467e25854f26944f5fde721a5d0af4b61bb))
* implement Howler.js for reliable audio streaming ([fc46122](https://github.com/quran-th/quran.in.th/commit/fc46122be58c2aa0e236f1d55d47b3d92d462a61))
* implement responsive design with mobile and desktop layouts ([992b7ed](https://github.com/quran-th/quran.in.th/commit/992b7eda5ab7fcc86612f3f57d825d0f3d23ea17))
* improve mobile UI, fix playback information issue ([9429aa9](https://github.com/quran-th/quran.in.th/commit/9429aa9d996cd79f37abcd160dc20954a94778d0))
* initial project setup with Nuxt 4 and TypeScript ([4f30c6f](https://github.com/quran-th/quran.in.th/commit/4f30c6f46d13faec8a68e7e417b458a918c33391))
* integrate ReciterInfoCard and hide translation features ([15f224b](https://github.com/quran-th/quran.in.th/commit/15f224b6d1ac010d93f084e12208f3841403956e))
* introduce play mode on full size screen ([ca33d5e](https://github.com/quran-th/quran.in.th/commit/ca33d5e899a10b1fda261158da6426f2f3508a3d))
* migrate to Cloudflare environment variables and add multi-reciter support ([275856f](https://github.com/quran-th/quran.in.th/commit/275856fc0e4180e23a22f1917506091abd84de8a))
* player mode ([e58bd47](https://github.com/quran-th/quran.in.th/commit/e58bd475d2ca673ca38e36a56c078a5ac2923b29))
* **player:** Refactor state management to use useState ([2a45c5c](https://github.com/quran-th/quran.in.th/commit/2a45c5c42ed55919b7b71bf4980f772fa745a4b2))
* revise mobile view ([ed27519](https://github.com/quran-th/quran.in.th/commit/ed2751953272f3002946c53da9b361eb45a80106))
* save current player state and config to local-storage ([8bf9cd8](https://github.com/quran-th/quran.in.th/commit/8bf9cd8d19f62473c9dbae2ec486f5e31124b3b2))
* ui refactoring and CI initialize ([#1](https://github.com/quran-th/quran.in.th/issues/1)) ([8ee0806](https://github.com/quran-th/quran.in.th/commit/8ee08065c30f4493d15233a75b76a58c587f0610))


### 🐛 Bug Fixes

* caching handling ([b93cf92](https://github.com/quran-th/quran.in.th/commit/b93cf92a5b2d8aab85422872b4fdd23163de5486))
* converting `releaserc` to utilize natively supported JSON ([54b2572](https://github.com/quran-th/quran.in.th/commit/54b257243c8ae670da86baedee9044f7c62fdd69))
* debounce local storage updating to limit unnecessary update within second ([914b51f](https://github.com/quran-th/quran.in.th/commit/914b51f7da75dad8a092f9fd1a373c7eaf00f4d7))
* load from previous played surah if exist ([f302460](https://github.com/quran-th/quran.in.th/commit/f302460b00c2023a67bd8981c960519674e88b99))
* prevent endless R2 audio reload cycles with retry limits ([8cac1b7](https://github.com/quran-th/quran.in.th/commit/8cac1b77a5c2ff437a57e1627c2d71263fbe2e3e))
* streaming issue ([d5879d6](https://github.com/quran-th/quran.in.th/commit/d5879d660667d06be4c74599891154667994cb7d))
* theme switch, auto player mode handling ([69ee36f](https://github.com/quran-th/quran.in.th/commit/69ee36fa70b57279ebcbdcc8fbcde3a0f100b293))


### ♻️ Code Refactoring

* breakdown component ([b74cf64](https://github.com/quran-th/quran.in.th/commit/b74cf64ff4e89705fbbc82721a5746d5f5709b70))
* optimize component styling for responsive design ([aafce7d](https://github.com/quran-th/quran.in.th/commit/aafce7d739e9cb45228c1a4c24b0c54204514c38))
* remove caching logic ([07044bc](https://github.com/quran-th/quran.in.th/commit/07044bcd3976ae831b3fb3a62438a5be977aad8d))
* split mobile and desktop layouts ([7a8888f](https://github.com/quran-th/quran.in.th/commit/7a8888f68da3a74b11cdfd15a8008da1c270f44b))
