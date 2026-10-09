---
title: Moving a v2 project to v3
description: Upgrade a project you made with plugin v2, from its config files to the code on the device.
sidebar:
  order: 8
---

## Situation

You have a project you made with v2 of the plugin, and you've just updated to v3. It looks like
this:

```
weather/
├── .ampy              (or a .micropython with a BAUD= line)
├── main.py
├── drivers/
│   └── sensor.py
├── lib/
│   └── led.py
├── pyproject.toml
└── pyrightconfig.json
```

`main.py` does `import sensor` and `import led`. Under v2 that worked, because every upload
went to the top of the **device**. You want the project working under v3, with nothing old
left behind on the device.

This entry goes through it in order. [Migrating from v2](/migrating-from-v2/) has the full
reference, including every old command and its new name.

## What you'll use

- `:checkhealth micropython_nvim` to check your setup
- [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) to set up the **stubs** the v3 way
- [`:MP files`](/commands/files/#mp-files) to clear out old copies on the device
- [`:MP upload_all`](/commands/running-code/#mp-upload_all) and
  [`:MP run_main`](/commands/running-code/#mp-run_main) to put the project back and try it
- [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) to check it runs on its own

## Steps

### 1. Update your Neovim config

Change your plugin spec and keymaps as in
[Migrating from v2](/migrating-from-v2/#your-plugin-spec):

- remove `baud` from `setup()`, and change `initialise()` to `setup()`
- change `:MPxxx` commands in keymaps to `:MP <subcommand>`, using the
  [command table](/migrating-from-v2/#commands)

Restart Neovim in the project folder, and run:

```vim
:checkhealth micropython_nvim
```

**You should see** `OK` for mpremote, and no errors. With only an `.ampy` file, the Project
section says `No project config in …`: the next step fixes that.

### 2. Move the port into `.micropython`

v3 doesn't read `.ampy`. If you have one, look at its `AMPY_PORT` line:

```
AMPY_PORT=/dev/ttyACM0
AMPY_BAUD=115200
```

Create `.micropython` next to it, with the same port:

```
PORT=/dev/ttyACM0
```

If you already have a `.micropython`, delete its `BAUD=` line instead.

Restart Neovim. **You should see** `Config loaded from <folder>/.micropython`. Delete `.ampy`.

Don't run `:MP init` to make the file: it also replaces your `main.py`, `pyproject.toml` and
`pyrightconfig.json`.

### 3. Set up the stubs

v3 installs stubs into a `typings/` folder in the project, and points pyright at it. With the
device connected, run:

```vim
:MP set_stubs
```

Pick the first suggestion, which matches your board and its MicroPython version.

**You should see** `MicroPython stubs set to: <stubs>`, then `Installed <stubs>`. It replaces the
stubs your `pyproject.toml` declared, and adds `"stubPath": "typings"` to `pyrightconfig.json`.

Add `typings/` to your `.gitignore`: v2's didn't have it.

### 4. Fix imports that relied on the top folder

v3 uploads keep the project's folders: `drivers/sensor.py` goes to `drivers/sensor.py` on the
device. Go through `main.py`'s imports:

- `import led` still works. Official MicroPython looks for modules in `lib/` as well as the top
  folder.
- `import sensor` doesn't: `drivers/` isn't searched. Change it to `from drivers import sensor`,
  or move `sensor.py` into `lib/`.

### 5. Clear the old copies off the device

v2 left `led.py` and `sensor.py` at the top of the device. MicroPython looks there first, so
those old copies would be imported instead of the new ones. Run:

```vim
:MP files
```

**You should see** your v2 uploads at the top level: `main.py`, `led.py`, `sensor.py`. Move to
each old copy of a file that now lives in a folder, here `led.py` and `sensor.py`, and press `d`
to delete it.

Leave `main.py`, and any files you didn't upload from this project.

### 6. Upload and try it

```vim
:MP upload_all
```

**You should see** `Upload all (… files) started`, then `completed successfully`. In `:MP files`,
`led.py` is now in `lib/` and `sensor.py` in `drivers/`.

Try the project without restarting the device:

```vim
:MP run_main
```

In v3, `:MP run_main` runs the `main.py` in your project, not the one on the device. Its imports
come from the device, which is why you uploaded first.

**You should see** your program running in a terminal. Press `Ctrl-C` to stop it.

### 7. Check it runs on its own

```vim
:MP hard_reset
```

**You should see** `Hard reset completed successfully`, and the device running `main.py` from
power-on, as it did under v2.

## What can go wrong

**`E492: Not an editor command: MPRun`.** A keymap or habit still uses a v2 command. The
[command table](/migrating-from-v2/#commands) has the new name for each.

**The port isn't used, and commands go to `auto`.** `.micropython` wasn't read. Check it's in the
folder you opened Neovim in, that it has a `PORT=` line, and that your config calls `setup()`.
Then restart Neovim.

**`ImportError: no module named 'sensor'`.** An import still expects a file at the top of the
device. Change it as in step 4, then `:MP upload_all` again.

**The old behaviour comes back after the change.** An old copy at the top of the device is being
imported instead of the new file. Check `:MP files` for a top-level copy, as in step 5, and
delete it.

**`:MP set_stubs` says `No MicroPython stubs declared…`.** Your `pyproject.toml` doesn't list any
stubs yet. Add the package it names to your dev dependencies, for example with
`uv add --dev <stubs>`, then run [`:MP install`](/commands/project-and-stubs/#mp-install).

**The statusline component disappeared.** Its condition, `exists()`, only looks for
`.micropython`. Do step 2 and restart Neovim.

**The statusline no longer shows a baud rate.** v3 has none: the component shows only the port.
