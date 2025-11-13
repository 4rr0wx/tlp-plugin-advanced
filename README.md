# TLP Plugin Advanced

This plugin for [Obsidian](https://obsidian.md/) highlights the UI of notes that you **classify with a TLP level in the frontmatter** or that are **contained in a specific folder**. This prevents you from leaking confidential data because the note is visually tagged as TLP WHITE, GREEN, AMBER, AMBER:STRICT, or RED the moment you open it.

![screenshot-full](https://raw.githubusercontent.com/dennisseidel/highlightpublicnotes-obsidian-plugin/master/images/example-highlightpublicnotes.png)

## Usage

After enabling the plugin in the settings menu, configure if you want to highlight notes in a specific folder (e.g. `03_ARTICLES`) or highlight a frontmatter attribute (e.g. `classification`). Within the frontmatter settings you can now define the exact string that represents each TLP level (defaults: `WHITE`, `GREEN`, `AMBER`, `AMBER:STRICT`, `RED`). Close the menu and add the selected classification to your note's frontmatter. **As the plugin only performs the highlight check when you load the file you need to reload the file to see the highlight immediately. You can reload the file by switching to another note and back**. When the note loads, the plugin checks the frontmatter/path and applies the matching TLP color.

## Alternative: cssclasses

Obsidian has a [cssclasses](https://forum.obsidian.md/t/apply-custom-css-to-certain-pages/15361) build-in. Combining a custome css snippet with the `cssclass:` attribute in the frontmatter provides a similar functionality.

## Compatibility

`tlp-plugin-advanced` currently requires Obsidian v0.9.12 or above to work properly.

## Installation

You can install the plugin via the Community Plugins tab within Obsidian. Just search for "TLP Plugin Advanced".

## Changes

You find the full changelog [here](https://github.com/dennisseidel/highlightpublicnotes-obsidian-plugin/blob/master/CHANGELOG.md).
