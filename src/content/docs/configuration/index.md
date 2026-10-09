---
title: Configuration
description: setup() options, the .micropython project file, the ignore list and upload on save.
---

The plugin is configured in two places:

- **`setup()`**, in your Neovim config: options that apply everywhere.
- **`.micropython`**, in each **project**: the **port** that project's device is on.

## `setup()` options

Call `setup()` once from your Neovim config. Every option is optional; these are the defaults:

```lua
require("micropython_nvim").setup({
  port = "auto",
  debug = false,
  upload_on_save = false,
  ui = {
    picker_layout = "select",
  },
})
```

With lazy.nvim, call it from `config`:

```lua
{
  "jim-at-jibba/micropython.nvim",
  dependencies = { "folke/snacks.nvim" }, -- optional
  config = function()
    require("micropython_nvim").setup({ upload_on_save = true })
  end,
}
```

| Option | Default | Effect |
|--------|---------|--------|
| `port` | `"auto"` | The port to use when the project's `.micropython` doesn't set one: `"auto"`, a path such as `"/dev/ttyACM0"`, or `"id:<serial>"`. See [Ports](/commands/ports/). |
| `debug` | `false` | Print extra detail about what the plugin is doing, such as the ports it found and the files an upload skipped. Read it with `:messages`. |
| `upload_on_save` | `false` | Upload each project file to the device when you save it. See [Upload on save](#upload-on-save). |
| `ui.picker_layout` | `"select"` | The [snacks.nvim picker](https://github.com/folke/snacks.nvim/blob/main/docs/picker.md) layout for lists, such as `"default"`, `"dropdown"` or `"ivy"`. Only used when snacks.nvim is installed. |

Options the plugin doesn't know are ignored, so a `baud` left over from v2 does nothing. See
[Migrating from v2](/migrating-from-v2/#baud-rate).

Call `setup()` even if you don't change any options. It's what reads the project's
`.micropython` file and turns on upload on save. Without it, every command still works, but
always with port `auto`.

## The `.micropython` file

A `.micropython` file in a folder makes that folder a project. It holds the port for the
project's device:

```
# MicroPython project configuration
# PORT can be: auto, /dev/ttyUSB0, /dev/ttyACM0, id:<serial>, etc.
PORT=auto
```

The format is one `KEY=VALUE` per line, and lines starting with `#` are comments. `PORT` is the
only key the plugin reads; anything else, such as a `BAUD=` line from v2, is ignored.

**When it's written:**

- [`:MP init`](/commands/project-and-stubs/#mp-init) creates it, with `PORT=auto`. If the
  project already has one, `:MP init` asks before overwriting it, along with the other project
  files.
- [`:MP set_port`](/commands/ports/#mp-set_port) replaces its `PORT=` line with the port you
  pick. If the file has no `PORT=` line, nothing is saved, so keep one in it.

Edit it yourself to use a value `:MP set_port` doesn't offer, such as `id:<serial>`.

**When it's read:** once, when `setup()` runs as Neovim starts, from the folder Neovim was
opened in. Open Neovim at the project's top folder, and restart it after editing the file by
hand.

**How it combines with `setup()`:** a `PORT` in `.micropython` wins over the `port` option.
`:MP set_port` changes the port straight away, for the rest of the session, as well as saving
it.

Being a project matters for more than the port: upload on save only works in one, the
[statusline](#statusline) condition checks for it, and
[`:checkhealth micropython_nvim`](/troubleshooting/#start-with-the-health-check) reports
whether it found the file.

`PORT=auto` works on any computer with one device plugged in, so it's safe to commit. A path
such as `/dev/ttyACM0` only suits your own computer.

## The ignore list

[`:MP upload_all`](/commands/running-code/#mp-upload_all) and
[upload on save](#upload-on-save) never upload files and folders on the **ignore list**. These
are the defaults:

```
.git  .gitignore  .micropython  .ampy  .python-version  .vscode  .idea
pyproject.toml  uv.lock  requirements.txt  README.md  LICENSE
env  venv  .venv  __pycache__  typings  pyrightconfig.json
project.pymakr  .micropy  micropy.json
```

Each entry is a name, ignored at any depth: `__pycache__` skips every `__pycache__` folder in
the project, and `README.md` skips `lib/README.md` too. Everything inside an ignored folder is
skipped.

### Adding your own

Give extra names, or paths from the project's top folder, as arguments to `:MP upload_all`:

```vim
:MP upload_all tests docs web/static
```

`tests` and `docs` are ignored at any depth, and `web/static` only at that path. A trailing `/`
makes no difference.

The extra entries only apply to that one upload: there's no option to add to the list for good.
If you always skip the same things, make a keymap:

```lua
vim.keymap.set("n", "<leader>mU", function()
  require("micropython_nvim").upload_all({ args = "tests docs" })
end, { desc = "MicroPython: upload project without tests and docs" })
```

Two things don't use your extra entries:

- **Upload on save** only uses the defaults.
- **[`:MP upload`](/commands/running-code/#mp-upload)** uploads the current file even if it's
  on the ignore list: asking for one file by hand always uploads it.

## Upload on save

```lua
require("micropython_nvim").setup({ upload_on_save = true })
```

With this on, each file you save is uploaded to the same path on the device, in the background:
saving `lib/led.py` uploads it to `lib/led.py` on the device. You get the same
`Upload lib/led.py started` and `… completed successfully` notifications as
[`:MP upload`](/commands/running-code/#mp-upload).

A save is only uploaded when:

- Neovim's current folder has a `.micropython` file
- the file is inside that folder
- the file isn't on the default [ignore list](#the-ignore-list)

Saves made while an upload is still running are queued, then sent together when it finishes,
so only one upload uses the port at a time. While the [REPL](/commands/repl/) is open it holds
the port, so uploads on save fail until you quit it.

Uploading only copies the file. The device keeps running whatever it was running: use
[`:MP run_main`](/commands/running-code/#mp-run_main) or a **hard reset** to run the new code.
[The fast edit loop](/playbook/fast-edit-loop/) shows how to put that together.

## Statusline

`require("micropython_nvim").statusline()` returns the project's port, ready for a statusline:
` auto`, or ` P:/dev/ttyACM0`. `require("micropython_nvim").exists()` is true in a project.
With [lualine](https://github.com/nvim-lualine/lualine.nvim):

```lua
require("lualine").setup({
  sections = {
    lualine_b = {
      {
        require("micropython_nvim").statusline,
        cond = package.loaded["micropython_nvim"] and require("micropython_nvim").exists,
      },
    },
  },
})
```

## Keymaps

The plugin doesn't set any keymaps. Map the `:MP` commands, or the plugin's Lua functions, to
the keys you like:

```lua
local mp = require("micropython_nvim")
vim.keymap.set("n", "<leader>mr", mp.run, { desc = "MicroPython: run file" })
vim.keymap.set("n", "<leader>mu", mp.upload_current, { desc = "MicroPython: upload file" })
vim.keymap.set("n", "<leader>mf", mp.files, { desc = "MicroPython: device files" })
```

The [REPL page](/commands/repl/) suggests keymaps for sending code. Each `:MP` command has a Lua
function with the same name, except these:

| Command | Lua function |
|---------|--------------|
| `:MP upload` | `upload_current()` |
| `:MP reset` | `soft_reset()` |
| `:MP erase` | `erase_one()` |
| `:MP send` | `repl_send_line()`, or `repl_send_selection()` from visual mode |
| `:MP send_buffer` | `repl_send_buffer()` |
| `:MP interrupt` | `repl_interrupt()` |
| `:MP health` | none: use `vim.cmd.checkhealth("micropython_nvim")` |
