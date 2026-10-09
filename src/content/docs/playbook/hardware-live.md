---
title: Poking at hardware live
description: Try out pins and sensors line by line, sending code from your buffer to the REPL.
sidebar:
  order: 3
---

## Situation

You want to find out how a piece of hardware behaves before writing a program around it: does
this pin drive the LED, what does the sensor read, how fast does the value change. Running a
whole file each time is slow, and typing into the **REPL** by hand loses your work. Instead,
write the code in a buffer and **send** it to the REPL a line or a block at a time, keeping
what works.

## What you'll use

- [`:MP repl`](/commands/repl/#mp-repl) to open the REPL in a split
- [`:MP send`](/commands/repl/#mp-send) to send the current line, or a selection
- [`:MP send_buffer`](/commands/repl/#mp-send_buffer) to send the whole file
- [`:MP interrupt`](/commands/repl/#mp-interrupt) to **interrupt** a loop without losing your variables

The [suggested keymaps](/commands/repl/) make each of these one keystroke.

The example reads the Pico's built-in temperature sensor and blinks its LED. Put it in a file
in your project, such as `scratch/live.py`:

```python
from machine import Pin, ADC
from time import sleep

led = Pin("LED", Pin.OUT)
led.on()
led.off()

sensor = ADC(4)
sensor.read_u16()

def temperature():
    volts = sensor.read_u16() * 3.3 / 65535
    return 27 - (volts - 0.706) / 0.001721

print(temperature())

while True:
    led.toggle()
    print(round(temperature(), 1))
    sleep(1)
```

## Steps

### 1. Open the REPL

```vim
:MP repl
```

**You should see** a split at the bottom of the screen with the MicroPython `>>>` prompt, and the
cursor in it. Press `<Esc><Esc>` to leave terminal mode, then `Ctrl-w k` to go back to your
code.

### 2. Send lines one at a time

Put the cursor on the first line, `from machine import Pin, ADC`, and run:

```vim
:MP send
```

**You should see** the line appear at the REPL prompt and run, as if you'd typed it. Your cursor
stays in your buffer. Do the same for the `sleep` import, `led = Pin(...)`, then `led.on()`.

**You should see** the LED come on. Send `led.off()` and it goes off.

### 3. Look at a value

Send `sensor = ADC(4)`, then `sensor.read_u16()`.

**You should see** a number such as `14000` in the REPL. A single expression sent on its own is
echoed, just like typing it at the prompt. Send `sensor.read_u16()` a few more times and watch
it change, or put your finger on the chip.

### 4. Send a block

Select the `def temperature():` function, from the `def` line to its `return`, with `V`, then
run:

```vim
:'<,'>MP send
```

**You should see** the function sent as one block. Nothing is printed: defining a function has
no output. Send `print(temperature())`.

**You should see** the temperature in °C, something like `22.4`.

Several lines are sent in paste mode, which keeps their indentation as it is. See
[`:MP send`](/commands/repl/#mp-send) for the details.

### 5. Start a loop, then stop it

Select the `while True:` loop and send it.

**You should see** the LED blinking and a new temperature printed every second.

The loop never ends, so stop it from your buffer:

```vim
:MP interrupt
```

**You should see** a `KeyboardInterrupt` traceback, then the `>>>` prompt again. Interrupting
stops the code but keeps everything you defined: send `led.off()` or `print(temperature())`
and they still work.

### 6. Change something and send the whole file

Change the loop, for example to `sleep(0.2)`, then send the whole file:

```vim
:MP send_buffer
```

**You should see** the file run from the top, then the faster loop. Stop it with
`:MP interrupt`.

### 7. Finish

When you're done, go to the REPL split and press `Ctrl-]`. This quits the REPL and frees the
device's **port** for other commands. Keep the lines that worked: they're already in your
buffer, ready to move into `main.py`.

## What can go wrong

**Another command fails with an error about the port.** While the REPL is open it holds the
port. [`:MP run`](/commands/running-code/#mp-run) and
[`:MP run_main`](/commands/running-code/#mp-run_main) run through the REPL instead, but other
commands, such as uploads and [`:MP files`](/commands/files/#mp-files), need it for themselves.
(`:MP flash` is the exception: it closes the REPL itself.)
Quit the REPL with `Ctrl-]` first. Closing the split's window isn't enough: the REPL keeps running
in the background.

**The REPL won't open, or shows an error about the port.** Something else holds it: a
`:MP run` terminal that's still running, a [mount](/commands/running-code/#mp-mount), or another
program such as Thonny. Stop or close it, then run `:MP repl` again.

**A value isn't printed when you send several lines.** In paste mode the REPL doesn't echo
expressions. Send the expression on its own line, or wrap it in `print()`.

**`SyntaxError` or `IndentationError` after sending part of a block.** A block has to be sent
whole: select from its first line to its last. Lines inside a loop or an `if` can be sent on
their own, because shared indentation is removed.

**`NameError` for something you defined earlier.** The REPL's state was cleared, by a
**soft reset** (`Ctrl-D` in the REPL, or [`:MP reset`](/commands/device-and-firmware/#mp-reset))
or a **hard reset**. Select everything above the loop and send it again.

**`The REPL is not open. Run :MP repl first.`** `:MP interrupt` only works in the REPL. Code
started with `:MP run` while the REPL was closed runs in its own terminal: press `Ctrl-C` there
to stop it.

**`ValueError` on `Pin("LED")` or `ADC(4)`.** These are the Pico's names for its LED and
temperature sensor. On other boards, use the pin numbers from your board's pinout.
