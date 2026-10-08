# micropython.nvim docs

The documentation site for [micropython.nvim](https://github.com/jim-at-jibba/micropython.nvim),
a Neovim plugin for working on MicroPython boards. It's built with
[Astro Starlight](https://starlight.astro.build) and published at
<https://jim-at-jibba.github.io/micropython-nvim-docs/>.

The site documents v3 of the plugin. Bugs and feature requests for the plugin itself belong in the
[plugin's issues](https://github.com/jim-at-jibba/micropython.nvim/issues).

## Working on the docs

```sh
npm install
npm run dev     # local preview at http://localhost:4321/micropython-nvim-docs/
npm run build   # build into ./dist and check every internal link
```

Pages live in `src/content/docs/`, one folder per sidebar section:

| Folder | Section |
|--------|---------|
| `getting-started/` | Getting started |
| `commands/` | Commands, grouped by task |
| `configuration/` | Configuration |
| `playbook/` | Playbook: walkthroughs of everyday situations |
| `troubleshooting/` | Troubleshooting |
| `migrating-from-v2/` | Migrating from v2 |

A new Markdown file in one of these folders joins the sidebar on its own.

Links between pages must be absolute and include the base path, such as
`/micropython-nvim-docs/playbook/`. The build fails on a broken or relative internal link.

Use the plugin's vocabulary from its
[CONTEXT.md](https://github.com/jim-at-jibba/micropython.nvim/blob/main/CONTEXT.md): for example,
**mount** and **upload** are different things, and "reset" is always a soft or hard reset.

## Publishing

Every push to `main` builds the site and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`).
