# BitBurner corrupted scripts

## What is [BitBurner](https://github.com/danielyxie/bitburner)?

Bitburner is a programming-based [incremental game](https://en.wikipedia.org/wiki/Incremental_game)
that revolves around hacking and cyberpunk themes.

The game can be played at <https://danielyxie.github.io/bitburner> or installed through
[Steam](https://store.steampowered.com/app/1812820/Bitburner/).

## What the hell are thoses scripts?

First of, any decent hacker need to use esotheric names, and the ones from this repository come from
[The Cthulhu Mythos](https://www.wikiwand.com/en/Cthulhu_Mythos).

Therefore concepts are translated as such:

- **corruption**: any script that use the `grow`, `weakend` or `hack` functions (placed in the
  `/_corruption/` directory)
- **Cthulhu**: where it all start, in charge of discovering the network, breaching securities and
  spreading updated corruptions scripts
- **Zvilpogghua** *Feaster from the Stars*:  orchestrator of corruptions, in charge only of
  scheduling them, discovery and scoring is not their concern (discovery is done by Cthulhu,
  without scoring will target either `foodnstuff` or `joesguns`)

## Getting Started

- `npm install --include-dev` install dependencies
- `npm run update` to update BitBurner definition files
- `npm run build` to build the scripts once
- `npm run dev` to start building the scripts on sources changes

## Extension Recommendations

There is a workspace file in `.vscode` which contains the recommended settings for all of these:

- [vscode-bitburner-connector](https://github.com/bitburner-official/bitburner-vscode)
  ([vscode extension marketplace](https://marketplace.visualstudio.com/items?itemName=bitburner.bitburner-vscode-integration))
  to upload your files into the game
- [auto-snippet](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.auto-snippet)
  to automate inserting the file template in `.vscode/snippets.code-snippets`
