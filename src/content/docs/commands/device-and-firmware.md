---
title: Device and firmware
description: Inspect and reset the device, install packages on it, and flash MicroPython firmware.
sidebar:
  order: 4
---

These commands work on the **device** itself rather than on your files. Apart from `:MP flash`,
which closes the [REPL](/commands/repl/) itself, they need the port: quit the REPL first.

:::tip[reset or hard_reset?]
A **soft reset** (`:MP reset`) restarts the MicroPython interpreter: running code stops and
variables and imports are cleared, but the device stays connected and its `main.py` doesn't run.
A **hard reset** (`:MP hard_reset`) restarts the whole device, as if you unplugged it and plugged
it back in: the USB connection drops for a moment, and the device starts up as it would at
power-on, running its `main.py`. Use a hard reset to try the program on the device, or when a
soft reset isn't enough.
:::

## `:MP info`

Shows the device's port, firmware version, board, storage used and free, and its clock, in a
small window.

| Key | Action |
|-----|--------|
| `s` | Set the device clock to this computer's time (`mpremote rtc --set`) |
| `q` or `<Esc>` | Close |

## `:MP reset`

**Soft resets** the device, in the background, to get back to a clean interpreter. mpremote
resets into its own control mode, so the device's `main.py` doesn't run afterwards.

## `:MP hard_reset`

**Hard resets** the device, in the background. The device restarts and runs its `main.py`, as
it would after being plugged in.

## `:MP mip`

Installs a package onto the device with [**mip**](https://docs.micropython.org/en/latest/reference/packages.html),
in the background. Your computer downloads the package, so the device doesn't need a network
connection.

```vim
:MP mip aioble                    " from micropython-lib
:MP mip github:org/repo           " from GitHub (gitlab: works too)
:MP mip github:org/repo@v1.2      " a branch or tag
:MP mip umqtt.simple lib/mqtt     " into a folder on the device
```

Without a target folder, mip installs into the device's `lib` folder. `<Tab>` completes
common micropython-lib packages, such as `aioble`, `neopixel`, `requests` and `umqtt.simple`,
and `:MP mip` with no package offers a list of them. `github:` and `gitlab:` complete too.

Packages installed with mip live on the device, for your code. **Stubs** live in your project,
for your editor: see [Project and stubs](/commands/project-and-stubs/).

## `:MP flash`

**Flashes** the device: installs or updates MicroPython **firmware** with
[mpflash](https://github.com/Josverl/mpflash), which you need to install first
(`uv tool install mpflash`).

```vim
:MP flash             " detect the board, then pick a version
:MP flash stable      " the latest release, no picker
:MP flash preview     " the latest nightly build
:MP flash 1.24.1      " a specific release
```

Without a version, it detects the board and offers a list: `stable` (the latest release),
`preview` (the latest nightly build) and up to ten recent releases. Listing the releases needs
`git`; without it, or offline, only `stable` and `preview` are offered. mpflash then downloads the
firmware for that board and flashes it in a terminal, so you can follow its progress and answer
any questions it asks. `<Tab>` completes `stable` and `preview`.

- Only the device on the configured port is flashed. With port `auto`, that's the first USB
  serial device mpremote finds.
- If the REPL is open, it's closed first, because mpflash needs the port.
- Flashing official MicroPython normally leaves the files on the device alone, but that's up to
  the firmware, so copy off anything you can't recreate first.
- If the device is connected but doesn't run MicroPython yet, mpflash asks which board it is.
- On a device with **custom firmware**, such as Pimoroni's Badger 2350 build, `:MP flash`
  replaces it with official MicroPython, along with anything frozen into it. Check that's what
  you want before you pick a version.
- A board with no serial port at all, like a Pico held in BOOTSEL mode, can't be found through
  the port. Flash it from a shell instead: `mpflash flash --board RPI_PICO_W`, using your
  board's ID.

How mpflash flashes each kind of board:

| Port | Method |
|------|--------|
| rp2 (Raspberry Pi Pico), samd, nrf | UF2: the device is put into its bootloader and the firmware copied to it |
| esp32, esp8266 | esptool, over the serial port |
| stm32 (pyboard) | DFU |

Other ports, such as mimxrt and renesas-ra, can only be flashed by mpflash over a debug probe,
which `:MP flash` doesn't set up.

After changing the firmware version, run [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs)
to pick stubs that match it.
