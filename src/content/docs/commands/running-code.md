---
title: Running code
description: Run code on the device, upload the project to it, or mount the project for live development.
sidebar:
  order: 1
---

Three ways to get your **project**'s code onto a **device**. Except for `:MP run` and
`:MP run_main`, which use the [REPL](/commands/repl/) when it's open, these need the port: quit
the REPL first.

- **Run** executes code on the device straight from your editor. Nothing is saved on the device.
- **Upload** copies files onto the device's filesystem, where they stay through a reset.
- **Mount** makes the project folder visible to the device while the mount is running, without
  copying anything.

:::tip[run or run_main?]
`:MP run` runs **the file you're editing**. `:MP run_main` runs **the project's `main.py`**,
whichever buffer you're in. Both run your local copy, but anything that file imports comes from
the device. Upload `lib/` and other modules first.
:::

:::tip[Upload or Mount?]
**Upload** when the code should stay on the device: it survives a **hard reset**, and on
official MicroPython an uploaded `main.py` runs on its own at power-on. **Mount** while you're iterating and don't want to copy files after every
change. When the mount ends, nothing is left on the device.
:::

## `:MP run`

Runs the current buffer's file on the device with `mpremote run`, in a terminal. Output and
errors appear in the terminal. Press `Ctrl-C` there to stop the code.

- It runs the **saved** file, so save before you run.
- If the [REPL](/commands/repl/) is open, the code runs there instead: `:MP run` stops whatever is
  running (Ctrl-C), then pastes the buffer, including any unsaved changes.

## `:MP run_main`

Runs the project's `main.py`, from whichever buffer you're in. It needs a `main.py` at the
project root; otherwise it warns `No main.py in <folder>. Open Neovim at the project root.`

Your local `main.py` runs, but the modules it imports are loaded from the device. Upload them
first with `:MP upload_all`. To run the `main.py` that's already on the device, use
[`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) instead.

Like `:MP run`, it runs in the REPL when the REPL is open.

## `:MP upload`

Uploads the current file to the same path on the device, in the background: `lib/led.py` goes
to `lib/led.py` on the device, and missing folders are created first. A file from outside the
project goes to the root of the device.

`:MP upload` uploads the file even if it's on the ignore list.

## `:MP upload_all`

Uploads the whole project in the background, keeping its folder layout. Files that already
match the copy on the device are skipped, so running it again only sends what changed.

Files and folders on the **ignore list** are never uploaded. A name is ignored at any depth,
so `__pycache__` skips every `__pycache__` folder. The default list:

```
.git  .gitignore  .micropython  .ampy  .python-version  .vscode  .idea
pyproject.toml  uv.lock  requirements.txt  README.md  LICENSE
env  venv  .venv  __pycache__  typings  pyrightconfig.json
project.pymakr  .micropy  micropy.json
```

Add names or project paths to skip for one upload as arguments:

```vim
:MP upload_all test.py docs web/static
```

### Upload on save

Set `upload_on_save = true` in [`setup()`](/getting-started/#install-the-plugin) and each file
you save is uploaded to the same path on the device. This only happens inside a project (a
folder with a `.micropython` file), and only the default ignore list applies. Files saved while
an upload is running are queued and sent together when it finishes. While the REPL is open,
uploads on save fail, because the REPL holds the port.

## `:MP mount`

Mounts the project folder on the device with `mpremote mount`, in a terminal. The device sees
the project as `/remote` and drops you into a REPL there, so `import main` runs your local
`main.py`.

```vim
:MP mount
```

```python
>>> import main
```

To try a change, save it, press `Ctrl-D` to **soft reset** the device (the mount stays), and
import again. A module that's already imported isn't reloaded until the reset.

Nothing is copied to the device: the mount lasts until you quit it with `Ctrl-]` or close its
terminal.

:::note
`:MP sync` is the old name for `:MP mount`. It still works and shows a deprecation warning the
first time you use it, but it will be removed. It isn't offered in completion or the picker.
:::
