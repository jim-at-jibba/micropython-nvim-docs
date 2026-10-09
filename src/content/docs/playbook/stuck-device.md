---
title: The device is stuck
description: Get an unresponsive device back, starting with the gentlest fix and only losing files if you have to.
sidebar:
  order: 6
---

## Situation

The **device** has stopped answering. Commands hang or fail, the **REPL** shows no prompt, or your
program is running and won't stop. You want it back, without losing anything you don't have to.

Work through the steps in order. Each one is a bigger hammer than the last: the first few only
stop running code, then you start deleting files from the device, and the last one replaces its
**firmware**. Stop at the first one that works.

## What you'll use

- [`:MP repl`](/commands/repl/#mp-repl) and [`:MP interrupt`](/commands/repl/#mp-interrupt) to
  **interrupt** running code
- [`:MP reset`](/commands/device-and-firmware/#mp-reset) for a **soft reset**
- [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) for a **hard reset**
- [`:MP erase`](/commands/files/#mp-erase) to **erase** the device's `main.py`
- [`:MP erase_all`](/commands/files/#mp-erase_all) to delete every file on the device
- [`:MP list_devices`](/commands/ports/#mp-list_devices) to check the device still shows up
- [`:MP flash`](/commands/device-and-firmware/#mp-flash) to reinstall MicroPython

## Steps

### 1. Check it's the device, not the port

A device's **port** can only be used by one program at a time, and a command that can't get it
fails as if the device were dead. Look for these, and close them:

- the [REPL](/commands/repl/) split: go to it and press `Ctrl-]` (closing the window isn't
  enough)
- a [`:MP run`](/commands/running-code/#mp-run) terminal: press `Ctrl-C`
- a **[mount](/commands/running-code/#mp-mount)**: press `Ctrl-]`
- another program: Thonny, a serial monitor, or mpremote in another terminal

**You should see** commands working again. If mpremote said
`failed to access … (it may be in use by another program)`, this was the problem.

### 2. Interrupt the running code

Code stuck in a loop keeps the device busy. Open the REPL:

```vim
:MP repl
```

If there's no `>>>` prompt, or your program's output is scrolling past, stop it:

```vim
:MP interrupt
```

**You should see** a `KeyboardInterrupt` traceback and the `>>>` prompt. Nothing is lost: your
program's variables are still there to inspect. Quit the REPL with `Ctrl-]` when you're done.

This also works on a program that started on its own at power-on, from the device's
`main.py`.

### 3. Soft reset

If interrupting didn't help, or the device is in a bad state, restart the interpreter. With the
REPL closed:

```vim
:MP reset
```

**You should see** `Soft reset started`, then `Soft reset completed successfully`. Running code
stops, and variables and imports are cleared. The device's `main.py` doesn't run afterwards, so
it can't get stuck again straight away. In the REPL, `Ctrl-D` does the same, except that it
runs `main.py`.

### 4. Hard reset

If the device is answering but still misbehaving, restart the whole device:

```vim
:MP hard_reset
```

**You should see** `Hard reset completed successfully`. The device restarts as if you'd unplugged
it, and runs its `main.py`.

`:MP hard_reset` has to reach the interpreter to restart it, so if `:MP reset` failed, it will
fail too. Unplug the device and plug it back in instead: that's the same restart.

If the device gets stuck again straight after a restart, the problem is its `main.py`: go to
step 5.

### 5. Remove the device's `main.py`

A `main.py` that hangs at start-up locks you out again after every restart. Delete it from the
device. If the only copy is on the device, keep one first with `D` in
[`:MP files`](/commands/files/#mp-files).

```vim
:MP erase
```

Pick `main.py` from the list. It's deleted as soon as you pick it, without asking again.

**You should see** `Delete main.py started`, then `Delete main.py completed successfully`. Do a
hard reset: the device now starts with nothing to run, and answers. Fix your `main.py` in the
project, try it with `:MP run`, and only then **[upload](/commands/running-code/#mp-upload)**
it again.

If a `boot.py` is on the device, it runs before `main.py` and can hang the same way. Delete it
the same way.

### 6. Erase everything

If something else on the device is the problem, or you'd rather start clean, delete every file:

```vim
:MP erase_all
```

It starts at once, without asking you to confirm. **You should see** a terminal that ends with
`Please Press ENTER to continue`, with no error above it. Your project isn't touched:
[`:MP upload_all`](/commands/running-code/#mp-upload_all) puts your files back, and packages you
installed with [`:MP mip`](/commands/device-and-firmware/#mp-mip) need installing again.

### 7. Reinstall MicroPython

The last resort, when the firmware itself is damaged or none of the above can reach the
device. If the device still shows up in
[`:MP list_devices`](/commands/ports/#mp-list_devices):

```vim
:MP flash stable
```

If `:MP flash` can't reach MicroPython on the device, its list is titled
`No MicroPython detected (mpflash will ask for the board)`: pick a version, then answer
mpflash's question about which board it is.

**You should see** mpflash download the firmware and flash it in a terminal. Flashing official
MicroPython normally leaves the device's files alone, so a `main.py` that hangs at start-up can
still be there afterwards. If it is, delete it as in step 5 now that the device answers.

If the device doesn't show up at all, you can't use the port: flash it from its bootloader
instead. On a Pico, that's the same as installing MicroPython on [a brand-new
Pico](/playbook/brand-new-pico/#1-install-micropython).

To wipe the device's files as well, erase its whole flash before installing MicroPython. On a
Pico, Raspberry Pi provides a `flash_nuke.uf2` for this: see
[resetting flash memory](https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html#resetting-flash-memory),
use the one for your board, and drag it onto the `RPI-RP2` drive (`RP2350` on a Pico 2). On an
ESP32 or ESP8266, use esptool's erase command. Other boards have their own way: check the
board's documentation.

## What can go wrong

**`could not enter raw repl`.** mpremote interrupts running code with `Ctrl-C` before every
command, and the code didn't stop. That happens when a program catches `KeyboardInterrupt`,
turns `Ctrl-C` off with `micropython.kbd_intr(-1)`, or is blocked inside a driver. Try step 2:
the REPL may still get through. If not, unplug the device, plug it back in and run the command
straight away, before `main.py` reaches the part that hangs. If it never gives you a gap, go to
step 7 and erase the whole flash.

**`no device found` with port `auto`.** Either nothing is connected, or the device's port is in
use, and `auto` skips busy ports. Do step 1, then check
[`:MP list_devices`](/commands/ports/#mp-list_devices).

**The device disappears from `:MP list_devices` after a hard reset.** It's restarting: the USB
connection drops for a moment. Wait a few seconds and try again. If it doesn't come back,
unplug it and plug it back in.

**The device keeps restarting by itself.** Code that crashes the firmware, or a `main.py` that
calls `machine.reset()`, can do that. Catch it between restarts with step 5. If it restarts too
quickly for that, go to step 7.

**On a board with custom firmware, `:MP erase_all` stops with an error.** Parts of its
filesystem can be read-only. The files it could delete are gone; the rest belong to the
firmware. `:MP flash` would replace that firmware with official MicroPython, so check that's
what you want first.
