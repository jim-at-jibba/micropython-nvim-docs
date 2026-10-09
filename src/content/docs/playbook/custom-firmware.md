---
title: A board with custom firmware
description: Work with a board whose firmware isn't official MicroPython, such as the Pimoroni Badger 2350, and know which commands behave differently.
sidebar:
  order: 7
---

## Situation

You have a Pimoroni Badger 2350, a **device** whose **firmware** isn't official MicroPython:
it runs Badgeware, Pimoroni's **custom firmware**, which is MicroPython with a launcher and apps
built in. You want
to write your own code for it from Neovim.

Most of the plugin works as it does on a Pico: running code, the **REPL**, **uploads**, the file
browser, **mip** and [`:MP info`](/commands/device-and-firmware/#mp-info). A few things work
differently, because of how the firmware is built:

| What's different | Why | What to do instead |
|------------------|-----|--------------------|
| A `main.py` you upload never runs at power-on | The launcher's `main.py` is frozen into the firmware, and runs instead | Run your code with [`:MP run`](/commands/running-code/#mp-run) or [`:MP run_main`](/commands/running-code/#mp-run_main), or make it a launcher app |
| Files in `system/` can't be changed | The apps live on a separate partition that MicroPython mounts read-only | Change them over USB disk mode |
| [`:MP flash`](/commands/device-and-firmware/#mp-flash) can't install Badgeware | Official MicroPython has no Badger build, and mpflash only installs official builds | Install Pimoroni's firmware by hand |
| Stubs only cover the chip, and `screen` and `badge` are flagged | Nobody publishes **stubs** for the Badger or its built-in modules | Tell pyright about them yourself |
| [`:MP erase_all`](/commands/files/#mp-erase_all) may stop with an error | It can't delete the read-only `system/` | Nothing: your own files are gone, the apps stay |

Other boards with custom firmware tend to differ in the same ways. The steps show how to find
out, then how to work around each one.

## What you'll use

- [`:MP list_devices`](/commands/ports/#mp-list_devices) and
  [`:MP info`](/commands/device-and-firmware/#mp-info) to see what the board is running
- [`:MP init`](/commands/project-and-stubs/#mp-init) to create the project
- [`:MP run`](/commands/running-code/#mp-run), [`:MP upload_all`](/commands/running-code/#mp-upload_all)
  and [`:MP run_main`](/commands/running-code/#mp-run_main) to run your code
- [`:MP files`](/commands/files/#mp-files) to look around the device

## Steps

### 1. Connect and see what it's running

Plug the Badger in over USB and press RESET once, so the launcher's menu shows. Run:

```vim
:MP list_devices
```

**You should see** a line ending in `2e8a:1100 Pimoroni Badger 2350 MicroPython`. Then:

```vim
:MP info
```

**You should see** the MicroPython version Badgeware is built on, and the board as
`Pimoroni Badger 2350 with RP2350`. mpremote interrupts the launcher to run each command;
press RESET to get the menu back.

A board name that isn't on [micropython.org/download](https://micropython.org/download/), or
a firmware made by the board's maker, means custom firmware. Expect the differences in the
table above.

### 2. Create the project

In a new folder:

```vim
:MP init
```

**You should see** a list titled with the Badger and its MicroPython version. The only
suggestion is for the chip, such as `micropython-rp2-stubs==1.29.0.*`: no stubs are published
for the Badger itself. Pick it, and answer **Yes** to `uv sync`.

`:MP init` writes a `main.py` that blinks a Pico's LED. Replace it with your own code.

### 3. Teach pyright about Badgeware

Badgeware puts `screen`, `badge` and its other modules into every program, without an import.
The stubs don't know them, so pyright flags each use as undefined.

pyright reads extra built-in names from a `__builtins__.pyi` file at the top of the project.
Create one:

```python
from typing import Any

screen: Any
badge: Any
```

Add the other Badgeware names you use, such as `color`, the same way. You don't get
completions for them, but they're no longer flagged.

**You should see** pyright stop flagging `screen` and `badge`. Restart your language server if
it doesn't.

### 4. Run code

Put this in `scratch/hello.py`:

```python
screen.text("Hello from Neovim", 24, 50)
badge.update()
```

Open it and run:

```vim
:MP run
```

**You should see** the text on the e-paper screen. The calls are Badgeware's: see
[Badgeware's documentation](https://badgewa.re/docs) for the rest of its API.

### 5. Run a project with several files

For a `main.py` that imports from `lib/`, upload the project, then run it:

```vim
:MP upload_all __builtins__.pyi
:MP run_main
```

The argument keeps `__builtins__.pyi`, which is only for your editor, off the device.

**You should see** your `main.py` running in a terminal. Stop it with `Ctrl-C`, then press RESET
to get the launcher back.

Your `main.py` is now on the device, but pressing RESET or doing a **hard reset** with
[`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) starts the launcher, not your
code. The launcher's frozen `main.py` runs before one on the device's files. To start your code
without Neovim, make it a launcher app instead: Badgeware's documentation shows how. Apps are
copied over USB disk mode (see the next step), not uploaded.

### 6. Look at the device's files

```vim
:MP files
```

**You should see** your files, a `state/` folder where the launcher keeps its settings, and
`system/`, with the apps in `system/apps/`.

You can open anything in `system/` to read it, but not save it: writes fail, because MicroPython
mounts that partition read-only. To change or add apps, double-tap RESET. The Badger switches
to USB disk mode and shows up as a `Badger2350` drive on your computer, where the apps can be
edited. Press RESET once to leave disk mode. While it's in disk mode it has no serial **port**, so
no `:MP` command can reach it.

### 7. Update the firmware by hand

Don't run `:MP flash` on the Badger. mpflash only installs official MicroPython: at best it
finds nothing to install, at worst it replaces Badgeware with plain MicroPython, launcher and
all.

Instead, download the latest release from
[Pimoroni's Badger 2350 releases](https://github.com/pimoroni/badger2350/releases/latest). There
are two files:

- `badger-vX.Y.Z-micropython.uf2` replaces the firmware and keeps your files.
- `badger-vX.Y.Z-micropython-with-filesystem.uf2` also resets the apps and files to the
  defaults.

Hold BOOT, on the back at the far left, tap RESET, then let go of BOOT. A drive called `RP2350`
appears. Drag the `.uf2` onto it.

**You should see** the drive disappear and the Badger restart into the launcher. Run
[`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) afterwards if the MicroPython
version changed.

## What can go wrong

**The serial port disappears.** The Badger's port goes away when it's asleep: press a front
button or RESET. If a
`Badger2350` drive is showing, it's in disk mode: press RESET once. Then try again; with port
`auto`, nothing else needs changing.

**A command hangs or says `could not enter raw repl` while the launcher runs.** mpremote
couldn't stop the launcher. Press RESET and run the command again straight away. If that doesn't
help, see [The device is stuck](/playbook/stuck-device/), but stop before step 7: reflashing
means Pimoroni's firmware, as in [step 7](#7-update-the-firmware-by-hand), not `:MP flash`.

**`Write system/… failed`, with a read-only error such as `EROFS`.** You saved a file in
`system/`. The device's copy is unchanged. Close the buffer with `:bd!`, and make the change
in disk mode instead.

**`:MP erase_all` stops with an error at `system/`.** The files it could delete, yours and the
launcher's settings in `state/`, are gone. The apps in `system/` stay. Press RESET and the
launcher starts with its default settings. If the launcher is broken, install the firmware again
as in step 7.

**You uploaded `main.py` and nothing changed after a reset.** That's the frozen launcher
winning, as in step 5. Use `:MP run_main`, or make an app.

**pyright still flags `screen` or `badge`.** `__builtins__.pyi` must be at the top of the
project, next to `pyrightconfig.json`. Restart your language server after creating it.
