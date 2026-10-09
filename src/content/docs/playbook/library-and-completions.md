---
title: Adding a library and getting completions
description: Install a package onto the device with mip, and stubs into the project so your editor knows the board.
sidebar:
  order: 4
---

## Situation

You've wired an SSD1306 OLED display to your Pico, and want to write text on it. MicroPython
doesn't include a driver for it, but [micropython-lib](https://github.com/micropython/micropython-lib)
has one. You want the driver on the **device**, and completions in Neovim while you write the
code.

Two different things get installed here, in two different places:

| | Installed with | Lives in | Used by |
|---|---|---|---|
| A package, such as `ssd1306` | [`:MP mip`](/commands/device-and-firmware/#mp-mip) | The device's `lib` folder | Your code, when it runs on the device |
| **Stubs** | [`:MP install`](/commands/project-and-stubs/#mp-install) or [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) | Your **project**'s `typings/` folder | Your language server, while you edit |

Stubs never go onto the device, and a package installed with mip never comes back to your
project. Neither one does the other's job.

## What you'll use

- [`:MP install`](/commands/project-and-stubs/#mp-install) to install the stubs your project
  declares
- [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) if the project has no stubs, or
  the wrong ones
- [`:MP mip`](/commands/device-and-firmware/#mp-mip) to install the driver onto the device
- [`:MP files`](/commands/files/#mp-files) to check it arrived
- [`:MP run`](/commands/running-code/#mp-run) to try it out

The steps use a display on I2C0, with SDA on GP4 and SCL on GP5.

## Steps

### 1. Get completions for the board

Open a Python file in your project and type `from machine import `. If your language server
offers `Pin`, `I2C` and the rest, the stubs are installed: go to step 2.

If it doesn't, the stubs are missing. That's normal after cloning a project, because
`typings/` isn't committed. Run:

```vim
:MP install
```

**You should see** `Running uv sync...`, `Dependencies installed`, then
`Installing <stubs> into typings/...` and `Installed <stubs>`. Your language server picks them
up straight away; if it doesn't, restart Neovim.

If `:MP install` stops at `Dependencies installed`, the project doesn't declare any stubs. Run
`:MP set_stubs` and pick the first suggestion, which matches your board and its MicroPython
version. Since none are declared yet, it doesn't install them: it tells you to add the package
to your dev dependencies, for example with `uv add --dev <stubs>`, then run `:MP install`
again.

### 2. Install the driver onto the device

Quit the [REPL](/commands/repl/) if it's open, then run:

```vim
:MP mip ssd1306
```

**You should see** `Install ssd1306 started`, then `Install ssd1306 completed successfully`.
Your computer downloads the package and copies it to the device, so the Pico doesn't need a
network connection.

`<Tab>` after `:MP mip ` completes common micropython-lib packages, and `:MP mip` on its own
offers a list of them.

### 3. Check it's on the device

```vim
:MP files
```

**You should see** a `lib/` folder with `ssd1306.mpy` in it. mip installs packages compiled to
`.mpy`, which load faster and use less memory than `.py` source. Press `q` to close the browser.

### 4. Use it

Put this in `main.py`:

```python
from machine import Pin, I2C
from ssd1306 import SSD1306_I2C

i2c = I2C(0, sda=Pin(4), scl=Pin(5))
display = SSD1306_I2C(128, 64, i2c)

display.fill(0)
display.text("Hello, Pico!", 0, 0)
display.show()
```

Run it:

```vim
:MP run
```

**You should see** `Hello, Pico!` on the display. While you type, `Pin` and `I2C` complete from
the stubs. `ssd1306` doesn't: see "No completions for the package" below.

### 5. Note what the device needs

mip packages aren't recorded anywhere in your project. A fresh device, or one you've erased,
won't have the driver until you run `:MP mip ssd1306` again. Note the packages your project
needs, for example in a comment at the top of `main.py` or in your README.

## What can go wrong

**No completions for the package, or `Import "ssd1306" could not be resolved`.** Stubs describe
the **firmware**'s modules, not packages you install with mip, and the `.mpy` on the device is
out of your editor's reach. The code still runs. If you want completions for the package too,
use its source instead of mip: save
[`ssd1306.py`](https://github.com/micropython/micropython-lib/blob/master/micropython/drivers/display/ssd1306/ssd1306.py)
at the top of your project and [upload](/commands/running-code/#mp-upload) it with your other
files. Your language server reads it from the project, and the device imports it from its top
folder.

**`ImportError: no module named 'ssd1306'`.** The package isn't on the device. Check with
`:MP files`, and run `:MP mip ssd1306` again: [`:MP erase_all`](/commands/files/#mp-erase_all),
or erasing the `lib` folder, removes it.

**`Install ssd1306 failed`.** Read the message under it:

- `failed to access … (it may be in use by another program)`, or `no device found` with port
  `auto`: something holds the port. Quit the REPL with `Ctrl-]`, and stop any mount or
  `:MP run` terminal.
- A message about the package not being found: check the name. micropython-lib packages are
  listed in its [index](https://micropython.org/pi/v2/index.json). For a package on GitHub, use
  `:MP mip github:org/repo`.
- A network error: your computer couldn't reach the package server.

**Completions for the wrong board.** `machine` suggests pins or functions your board doesn't
have, or misses ones it does. The project's stubs are for another board or MicroPython
version. Run `:MP set_stubs` and pick the first suggestion.

**Stubs installed, but the language server doesn't use them.** It must read `typings/`.
`pyrightconfig.json` from `:MP init` already says so. If your pyright settings are in
`pyproject.toml` instead, add `stubPath = "typings"` under `[tool.pyright]`. Language servers
other than pyright and basedpyright may need their own setting.

**`uv not found`.** `:MP install` and `:MP set_stubs` need [uv](https://docs.astral.sh/uv/).
`:MP mip` doesn't: it only needs mpremote.
