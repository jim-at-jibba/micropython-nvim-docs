---
title: Migrating from v2
description: Every breaking change in v3, and what to do about each one.
---

v3 puts every command under one `:MP` command and removes the old settings. Most configs need a
few small changes. This page lists every breaking change from the
[v3.0.0 release](https://github.com/jim-at-jibba/micropython.nvim/releases/tag/v3.0.0), with
what to do about it. For a walkthrough of upgrading a real **project**, see
[Moving a v2 project to v3](/playbook/v2-project/).

## Checklist

1. Update your plugin spec: [remove `baud`, and the dependencies v3 doesn't need](#your-plugin-spec).
2. Change `:MPxxx` commands in your keymaps to [`:MP <subcommand>`](#commands).
3. In each project, replace a [`.ampy` file](#ampy-files) with `.micropython`, and delete any
   [`BAUD=` line](#baud-rate).
4. Check that your project's [imports still work](#uploads-keep-project-paths) now that uploads
   keep folders.
5. Restart Neovim and run `:checkhealth micropython_nvim`.

## Your plugin spec

Before, with lazy.nvim:

```lua
{
  "jim-at-jibba/micropython.nvim",
  dependencies = { "folke/snacks.nvim" },
  config = function()
    require("micropython_nvim").setup({ baud = 115200 })
  end,
  keys = {
    { "<leader>mr", "<cmd>MPRun<cr>", desc = "MicroPython: run file" },
  },
}
```

After:

```lua
{
  "jim-at-jibba/micropython.nvim",
  dependencies = { "folke/snacks.nvim" }, -- optional
  config = function()
    require("micropython_nvim").setup()
  end,
  keys = {
    { "<leader>mr", "<cmd>MP run<cr>", desc = "MicroPython: run file" },
  },
}
```

What changed:

- **`baud` is gone.** See [Baud rate](#baud-rate).
- **snacks.nvim is optional.** Without it, terminals open in a floating Neovim terminal and
  lists use `vim.ui.select`. Keep it for the nicer pickers.
- **toggleterm.nvim and dressing.nvim are no longer used.** If your spec still lists them as
  dependencies from an older version, remove them, unless something else of yours uses them.
  `vim.ui.select` uses whatever you've set it up with, dressing.nvim included.
- **`initialise()` is gone.** Call `setup()` instead. See
  [Removed Lua functions](#removed-lua-functions).

Every option `setup()` takes is on the [Configuration](/configuration/#setup-options) page.

## Commands

`:MP <subcommand>` replaces the `:MPxxx` commands, which no longer exist. Typing an old one
gives `E492: Not an editor command`.

| v2 | v3 |
|----|----|
| `:MPRun` | [`:MP run`](/commands/running-code/#mp-run) |
| `:MPRunMain` | [`:MP run_main`](/commands/running-code/#mp-run_main), which [changed](#mp-run_main-runs-your-local-mainpy) |
| `:MPUpload` | [`:MP upload`](/commands/running-code/#mp-upload), which [keeps project paths](#uploads-keep-project-paths) |
| `:MPUploadAll` | [`:MP upload_all`](/commands/running-code/#mp-upload_all) |
| `:MPRepl` | [`:MP repl`](/commands/repl/#mp-repl) |
| `:MPSync` | [`:MP mount`](/commands/running-code/#mp-mount) |
| `:MPReset` | [`:MP reset`](/commands/device-and-firmware/#mp-reset) |
| `:MPHardReset` | [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) |
| `:MPListFiles` | [`:MP list_files`](/commands/files/#mp-list_files) |
| `:MPListDevices` | [`:MP list_devices`](/commands/ports/#mp-list_devices) |
| `:MPEraseOne` | [`:MP erase`](/commands/files/#mp-erase) |
| `:MPEraseAll` | [`:MP erase_all`](/commands/files/#mp-erase_all) |
| `:MPInit` | [`:MP init`](/commands/project-and-stubs/#mp-init) |
| `:MPInstall` | [`:MP install`](/commands/project-and-stubs/#mp-install) |
| `:MPSetPort` | [`:MP set_port`](/commands/ports/#mp-set_port) |
| `:MPSetStubs` | [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) |
| `:MPSetBaud` | Removed: see [Baud rate](#baud-rate) |

Arguments work the same way: `:MPUploadAll test.py docs` is now `:MP upload_all test.py docs`.

Keymaps that call the plugin's Lua functions, such as `require("micropython_nvim").run`, keep
working, apart from the [removed ones](#removed-lua-functions). `sync()` still works, but
`mount()` is its new name.

`:MP sync`, the first v3 name for `:MP mount`, also still works for now. It shows a notice the
first time you use it, and will be removed.

v3 also adds commands v2 didn't have, such as [`:MP files`](/commands/files/#mp-files) and the
REPL's [`:MP send`](/commands/repl/#mp-send). The [Commands](/commands/) section lists them all.

## Baud rate

mpremote doesn't use a baud rate, so it's gone from v3:

- `:MPSetBaud` and `set_baud_rate()` are removed.
- Remove `baud` from your `setup()` call. Leaving it in does nothing.
- A `BAUD=` line in `.micropython` is ignored. Delete it.

The statusline component shows only the port now: ` P:/dev/ttyACM0` instead of
` P:/dev/ttyACM0 BR:115200`.

## `.ampy` files

v3 no longer reads `.ampy` files. A folder with only `.ampy` isn't a project any more:
commands use port `auto`, upload on save is off, and `exists()`, the statusline condition, is
false.

To move the port across, create a `.micropython` file next to `.ampy`, with the port from its
`AMPY_PORT` line:

```
# .ampy
AMPY_PORT=/dev/ttyACM0
AMPY_BAUD=115200
```

```
# .micropython
PORT=/dev/ttyACM0
```

`PORT=auto` works too, if only one device is plugged in. Restart Neovim to load it, then delete
`.ampy`.

Don't use `:MP init` for this in an existing project. It creates `.micropython` too, but it also
replaces `main.py`, `pyproject.toml` and the other project files, after asking.

## `:MP run_main` runs your local `main.py`

In v2, `:MPRunMain` ran the `main.py` stored on the device. In v3,
[`:MP run_main`](/commands/running-code/#mp-run_main) runs the `main.py` in your project, like
`:MP run` on that file.

The modules it imports still come from the device. Upload them first, with
[`:MP upload_all`](/commands/running-code/#mp-upload_all), or `main.py` stops with an
`ImportError`.

To run the copy on the device instead, use
[`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset): the device restarts and runs
its `main.py`. A **soft reset** with [`:MP reset`](/commands/device-and-firmware/#mp-reset) doesn't
run it.

## Uploads keep project paths

In v2, `:MPUpload` uploaded the current file to the device's top folder, by name:
`lib/led.py` was uploaded as `led.py`. In v3, [`:MP upload`](/commands/running-code/#mp-upload)
keeps the file's path, as `:MPUploadAll` already did: `lib/led.py` goes to `lib/led.py` on the
device, and missing folders are created first.

If you only ever uploaded with `:MPUploadAll`, nothing changes. If you used `:MPUpload` on files
in folders, your code may have relied on finding them at the top of the device:

- **Files in `lib/`** keep working. Official MicroPython looks for modules in `/lib` as well as
  the top folder, so `import led` still finds `lib/led.py`.
- **Files in other folders** move. If your code does `import sensor` for `drivers/sensor.py`,
  change it to `from drivers import sensor`, or move the file to `lib/` or the top of the
  project.
- **Old copies at the top of the device win.** MicroPython looks in the top folder before
  `/lib`, so a `led.py` that `:MPUpload` put there is imported instead of your new
  `lib/led.py`. Delete the old copies with [`:MP files`](/commands/files/#mp-files) (`d`) or
  [`:MP erase`](/commands/files/#mp-erase).

A file from outside the project is still uploaded to the device's top folder.

## Removed Lua functions

| Removed | Use instead |
|---------|-------------|
| `initialise()` | `setup()` |
| `set_baud_rate()` | Nothing: see [Baud rate](#baud-rate) |
| `get_baud()`, `set_baud()` and `get_connect_arg()` in `micropython_nvim.config` | Nothing |
| `get_ampy_path()`, `ampy_config_exists()`, `read_ampy_config()` and `ampy_install_check()` in `micropython_nvim.utils` | Nothing: see [`.ampy` files](#ampy-files) |
| `get_mpremote_base()` in `micropython_nvim.utils` | Nothing |

The functions in `require("micropython_nvim")` that your keymaps are likely to use are all
still there. The [Configuration](/configuration/#keymaps) page lists their names.
