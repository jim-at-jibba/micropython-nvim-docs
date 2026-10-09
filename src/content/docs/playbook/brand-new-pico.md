---
title: A brand-new Pico
description: From a Pico straight out of the bag to a blinking LED from your own project.
sidebar:
  order: 1
---

## Situation

You have a Raspberry Pi Pico (a Pico, Pico W, Pico 2 or Pico 2 W) that has never run MicroPython,
and the plugin is [installed](/getting-started/). By the end, MicroPython is on the **device**,
you have a **project** with **stubs** for it, and the project's `main.py` blinks the on-board LED,
first from the editor and then on its own at power-on.

## What you'll use

- [`:MP list_devices`](/commands/ports/#mp-list_devices) to check the device is connected
- [`:MP init`](/commands/project-and-stubs/#mp-init) to create the project and pick stubs
- [`:MP set_port`](/commands/ports/#mp-set_port) if you have more than one device plugged in
- [`:MP run`](/commands/running-code/#mp-run) to try `main.py` without copying it
- [`:MP upload`](/commands/running-code/#mp-upload) and
  [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) to make it run at power-on
- [`:MP flash`](/commands/device-and-firmware/#mp-flash) later, to update the **firmware**

## Steps

### 1. Install MicroPython

A new Pico has no **firmware** yet, so it has no serial **port** and
[`:MP flash`](/commands/device-and-firmware/#mp-flash) can't find it. Install MicroPython the
first time without the plugin:

1. Hold the **BOOTSEL** button while you plug the Pico in. A drive called `RPI-RP2` appears
   (`RP2350` on a Pico 2).
2. Download the `.uf2` file for your board from
   [micropython.org/download](https://micropython.org/download/?vendor=Raspberry%20Pi). Pick the
   right one: the Pico W and Pico 2 W have their own builds.
3. Drag the `.uf2` onto the drive.

**You should see** the drive disappear as the Pico restarts into MicroPython.

If you have [mpflash](https://github.com/Josverl/mpflash) installed, you can do steps 2 and 3
from a shell instead, with the Pico still in BOOTSEL mode: `mpflash flash --board RPI_PICO_W`,
using your board's ID (`RPI_PICO`, `RPI_PICO_W`, `RPI_PICO2` or `RPI_PICO2_W`).

### 2. Check the device is connected

Make a folder for the project and open Neovim in it:

```sh
mkdir blink && cd blink
nvim .
```

Run:

```vim
:MP list_devices
```

**You should see** a notification starting `Available MicroPython devices:`, with a line for the
Pico ending in `2e8a:0005 MicroPython Board in FS mode`.

### 3. Create the project

```vim
:MP init
```

**You should see** `Detecting the board for stubs...`, then a list titled with your board and
its MicroPython version, such as `Stubs for Raspberry Pi Pico W with RP2040, MicroPython 1.26.1:`.
The first items are the stubs for your exact board and version, such as
`micropython-rp2-rpi_pico_w-stubs==1.26.1.*`. Pick the first one.

The plugin writes `main.py`, `.micropython`, `pyproject.toml`, `pyrightconfig.json` and
`.gitignore`, then says `Project created with <stubs>` and asks
``Run `uv sync` to install dependencies?``. Pick **Yes**.

**You should see** `Running uv sync...`, `Dependencies installed`, then
`Installing <stubs> into typings/...` and `Installed <stubs>`.

Open `main.py`. If your language server is pyright or basedpyright, hovering `Pin` now shows
MicroPython's signature, and `machine` isn't flagged as missing.

### 4. Choose the port, if you need to

The project starts with port `auto`, which uses the first USB serial device mpremote finds. With
only the Pico plugged in, that's the Pico, and you can skip this step.

With more than one device plugged in, run:

```vim
:MP set_port
```

Pick the Pico's port from the list. **You should see** `Port set to: <port>`, and `.micropython`
now has `PORT=<port>`.

### 5. Run the blink

With `main.py` open:

```vim
:MP run
```

**You should see** a terminal printing `LED is ON` and `LED is OFF` every half second, and the
LED on the Pico blinking. Nothing has been copied to the device: the code ran straight from your
editor.

Press `Ctrl-C` in the terminal to stop it, then Enter to close the terminal.

### 6. Make it run on its own

On official MicroPython, a `main.py` stored on the device runs every time it powers up. Copy
yours there, then restart the device:

```vim
:MP upload
:MP hard_reset
```

**You should see** `Upload main.py started`, then `Upload main.py completed successfully`. After
the **hard reset** the LED blinks again, this time without any terminal. Unplug the Pico and plug
it into any USB power supply, and it keeps blinking.

### Later: updating MicroPython

Now that the Pico runs MicroPython, the plugin can update it for you. With mpflash installed,
run [`:MP flash`](/commands/device-and-firmware/#mp-flash) and pick `stable`. Afterwards, run
[`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) so the stubs match the new version.

## What can go wrong

**No `RPI-RP2` drive appears.** Some USB cables only carry power. Try another cable, and make
sure you're holding BOOTSEL as the cable goes in, not after.

**`:MP list_devices` says `No MicroPython devices found`.** The Pico is still in BOOTSEL mode,
or the firmware didn't install. Unplug it and plug it back in without holding BOOTSEL. If the
`RPI-RP2` drive appears on its own, MicroPython isn't installed: go back to step 1.

**The stubs list is titled `No device detected. Select stubs:`.** `:MP init` couldn't read the
device, so it can't suggest stubs for it. Check `:MP list_devices`, and close anything else
using the port, such as the [REPL](/commands/repl/), Thonny or another mpremote. Then cancel and
run `:MP init` again, or pick `micropython-rp2-stubs` from the list.

**You ran `:MP set_port` before `:MP init`.** With no `.micropython` yet, the port is only kept
until you quit Neovim, and `:MP init` writes `PORT=auto`. Run `:MP set_port` again after
`:MP init` to save it.

**`uv not found`.** `:MP init` still creates the project, but can't install anything. Install
[uv](https://docs.astral.sh/uv/), restart Neovim, and run
[`:MP install`](/commands/project-and-stubs/#mp-install).

**`:MP run` fails with an error about the port.** Another program holds it. Quit the REPL with
`Ctrl-]`, and close Thonny or any other terminal running mpremote.

**The LED doesn't blink, or there's an error about `"LED"`.** `Pin("LED")` is the Pico's name
for its on-board LED. On other boards, change it in `main.py` to the pin your LED is on, such as
`Pin(2, Pin.OUT)` on many ESP32 boards.

**The LED doesn't blink after the hard reset.** Check that `main.py` is at the top of the device
with [`:MP list_files`](/commands/files/#mp-list_files). On a board with **custom firmware**,
`main.py` may be frozen into the firmware and run instead of yours.
