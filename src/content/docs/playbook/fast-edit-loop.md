---
title: The fast edit loop
description: Change code and see it running on the device in seconds, with upload on save or a mount.
sidebar:
  order: 2
---

## Situation

Your **project** has grown past one file: `main.py` imports modules from `lib/`. You're changing
them over and over, and want each change running on the **device** with as few steps as
possible.

There are two ways to set this up:

- **Upload on save, then `run_main`**: every file you save is **uploaded**, and one command runs
  `main.py`. What's on the device always matches your project, and it keeps working after you
  unplug.
- **Mount**: the device reads the project straight from your computer, so there's nothing to
  upload. Nothing is left on the device afterwards.

Pick upload on save when the device should end up running this code on its own. Pick a mount
when you're experimenting and don't want to change what's stored on the device.

## What you'll use

- [Upload on save](/commands/running-code/#upload-on-save), turned on in `setup()`
- [`:MP upload_all`](/commands/running-code/#mp-upload_all) to bring the device up to date once
- [`:MP run_main`](/commands/running-code/#mp-run_main) to run the project's `main.py`
- [`:MP mount`](/commands/running-code/#mp-mount) for the mount loop instead

The examples use this layout:

```
main.py           # from lib.greeting import greeting; print(greeting("world")) ...
lib/__init__.py
lib/greeting.py   # MESSAGE = "Hello"
```

## Steps: upload on save

### 1. Turn on upload on save

In your plugin config:

```lua
require("micropython_nvim").setup({
  upload_on_save = true,
})
```

Restart Neovim in the project folder. To try it for one session without editing your config,
run `:lua require("micropython_nvim").setup({ upload_on_save = true })` instead.

### 2. Bring the device up to date

Upload on save only sends the files you save from now on. Upload the rest once:

```vim
:MP upload_all
```

**You should see** `Upload all (N files) started`, then `Upload all (N files) completed
successfully`. Files already on the device with the same content are skipped, so this is quick
to run again.

### 3. Change a file and save it

Edit `lib/greeting.py`, for example `MESSAGE = "Hi"`, and `:w`.

**You should see** `Upload lib/greeting.py started`, then `Upload lib/greeting.py completed
successfully`. The file goes to `lib/greeting.py` on the device, the same path as in your
project.

### 4. Run it

From any buffer:

```vim
:MP run_main
```

**You should see** a terminal with your program's output, including the change: `Hi, world!`.
Press `Ctrl-C` to stop the program, then Enter to close the terminal.

### 5. Repeat

From now on, the loop is: edit, `:w`, `:MP run_main`. A key for `run_main` makes it two
keystrokes:

```lua
vim.keymap.set("n", "<leader>mm", require("micropython_nvim").run_main, { desc = "MicroPython: run main.py" })
```

Because each file was uploaded as you saved it, the device is already running your latest code
the next time it powers up.

## Steps: mount

### 1. Mount the project

```vim
:MP mount
```

**You should see** a terminal saying the local directory is mounted at `/remote`, then the
MicroPython `>>>` prompt.

Leave upload on save off for this loop. The mount holds the device's **port**, so every upload
on save would fail while it's running.

### 2. Run your code

At the prompt:

```python
>>> import main
```

**You should see** your program's output. It ran from the files in your project, not from
anything stored on the device. Press `Ctrl-C` to stop it.

### 3. Change a file and run it again

Edit and save a file. Then, in the mount terminal, press `Ctrl-D` to **soft reset** the device
and `import main` again. The soft reset keeps the mount, and clears the modules that were
already imported, so your change is picked up.

**You should see** the new output, without having uploaded anything.

### 4. Finish

Press `Ctrl-]` to end the mount. The device is left exactly as it was before you started: none
of your project's files are on it.

## What can go wrong

**Saves don't upload.** Upload on save only works in a project, a folder with a `.micropython`
file, opened as Neovim's working directory. Files on the
[ignore list](/commands/running-code/#mp-upload_all), such as `README.md` and `pyproject.toml`,
and files outside the project, are never uploaded on save.

**`Upload … failed` while a program is running.** The device's **port** can only be used by one
program at a time. A `:MP run_main` terminal that's still running holds it, and so do the
[REPL](/commands/repl/) and a mount. Stop the program with `Ctrl-C`, or quit the REPL or mount
with `Ctrl-]`, then save again.

**`ImportError: no module named 'lib.greeting'`.** `:MP run_main` runs your local `main.py`, but
the modules it imports come from the device. Run `:MP upload_all` once (step 2) so they're
there.

**An old version of a module runs.** With upload on save, check the upload finished before you
ran the code: it's in the background, and a large file takes a moment. With a mount, press
`Ctrl-D` before importing again: without a soft reset, MicroPython reuses the module it already
imported.

**`No main.py in <folder>. Open Neovim at the project root.`** `:MP run_main` looks for
`main.py` in Neovim's working directory. Open Neovim in the project folder, or `:cd` to it.

**The program runs at power-on when you didn't want it to.** That's upload on save doing its
job: `main.py` is on the device. Use a mount while experimenting, or remove it with
[`:MP erase`](/commands/files/#mp-erase).
