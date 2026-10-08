---
title: Getting started
description: Install micropython.nvim, create a project and run your first code on a device.
---

This page takes you from nothing to code running on a **device**: a board running MicroPython,
plugged in over USB.

## Requirements

- [Neovim](https://github.com/neovim/neovim/releases) 0.9 or later
- [mpremote](https://docs.micropython.org/en/latest/reference/mpremote.html), MicroPython's
  official tool for talking to a device. The plugin runs every device command through it.
- [uv](https://docs.astral.sh/uv/), which installs your project's Python dependencies and type
  stubs (macOS and Linux)
- Optional: [snacks.nvim](https://github.com/folke/snacks.nvim) for nicer terminals and pickers.
  Without it the plugin uses Neovim's built-in terminal and `vim.ui.select`.
- Optional: [mpflash](https://github.com/Josverl/mpflash), only needed to install or update
  MicroPython on a board with `:MP flash`

Install uv, then mpremote:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install mpremote
```

If you'd rather use pip, `pip install mpremote` works too. mpflash installs the same way:
`uv tool install mpflash`.

## Install the plugin

With [lazy.nvim](https://lazy.folke.io/):

```lua
{
  "jim-at-jibba/micropython.nvim",
  dependencies = { "folke/snacks.nvim" }, -- optional
  config = function()
    require("micropython_nvim").setup()
  end,
}
```

Call `setup()` even if you don't change any options: it's what reads a project's `.micropython`
file when Neovim starts, so the plugin knows which **port** to use. These are the defaults:

```lua
require("micropython_nvim").setup({
  port = "auto",          -- "auto", a port like "/dev/ttyACM0", or "id:<serial>"
  debug = false,
  upload_on_save = false, -- upload project files to the device when you save them
  ui = {
    picker_layout = "select", -- snacks.nvim picker layout
  },
})
```

Restart Neovim, then run `:checkhealth micropython_nvim` (or `:MP health`). It checks your Neovim
version, whether mpremote, uv, mpflash and snacks.nvim were found, the project's settings and
whether a device is connected, and tells you how to install anything required that's missing.

## Create a project

A **project** is the folder you open Neovim in: it holds the code meant for the device and its
`.micropython` settings. The plugin assumes Neovim is opened at the project's root.

1. Plug in your device.
2. Make a folder for the project and open Neovim in it:

   ```sh
   mkdir blink && cd blink
   nvim .
   ```

3. Run `:MP init`. It reads the connected device and suggests matching **stubs**, the type-only
   packages that give your editor completion and checking for MicroPython modules such as
   `machine`. Pick the first suggestion unless you know you want something else.
4. Answer **Yes** when asked to run `uv sync`. This installs the project's Python dependencies
   and puts the stubs in `typings/`, where the language server finds them.

`:MP init` creates these files:

| File | What it's for |
|------|---------------|
| `main.py` | A starter program that blinks the board's LED |
| `.micropython` | Project settings; starts as `PORT=auto` |
| `pyproject.toml` | Python dependencies, including the stubs |
| `pyrightconfig.json` | Points the pyright language server at the stubs |
| `.gitignore` | Keeps `.venv/` and the installed stubs out of git |

If you answered **No** to `uv sync`, run `:MP install` later to do the same thing.

## Run code on the device

Open `main.py` and run:

```vim
:MP run
```

A terminal opens and the code **runs** on the device straight from your editor, without being
**uploaded** first: the LED blinks and the terminal prints `LED is ON` and `LED is OFF`. Press
`Ctrl-C` in the terminal to stop it.

The starter program uses `Pin("LED")`, the on-board LED's name on a Raspberry Pi Pico. On other
boards, change it to your LED's pin number.

`auto` connects to the first device mpremote finds. If you have more than one plugged in, or
`:MP run` can't find yours, pick it with `:MP set_port`; the choice is saved in `.micropython`.

## Next steps

- Type `:MP <Tab>` to see every command, or run `:MP` on its own to pick one from a list.
- Add a key for running the current file:

  ```lua
  vim.keymap.set("n", "<leader>mr", require("micropython_nvim").run)
  ```

- Browse the [Playbook](/micropython-nvim-docs/playbook/) for walkthroughs of everyday situations.
