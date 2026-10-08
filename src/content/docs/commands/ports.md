---
title: Ports
description: Choose which serial port the device is on, and see what's connected.
sidebar:
  order: 6
---

The **port** is the serial path a **device** is reached on, such as `/dev/ttyACM0` on Linux or
`/dev/cu.usbmodem1101` on macOS. A project's port is stored in its `.micropython` file:

```
PORT=auto
```

| Value | Meaning |
|-------|---------|
| `auto` | Use the first USB serial device mpremote finds. The default. |
| `/dev/ttyACM0` | Always use this port |
| `id:<serial>` | Use the device with this USB serial number, whichever port it's on |

`auto` is fine with one device plugged in. With several, pick one: a fixed path, or `id:` if
the path changes between plug-ins. You can also set a default
in [`setup()`](/getting-started/#install-the-plugin) with the `port` option; a project's
`.micropython` file overrides it.

## `:MP set_port`

Shows a list of ports to choose from: `auto`, then every serial port mpremote can see. If
mpremote sees none, it lists likely serial paths such as `/dev/ttyACM*` instead. The
choice is used straight away and saved in the project's `.micropython` file. Outside a project
it's used until you quit Neovim, with a warning that there's no `.micropython` file to save it
in.

To use `id:<serial>`, which isn't in the list, edit `.micropython` yourself. `:MP list_devices`
shows each device's serial number. The plugin reads `.micropython` when Neovim starts, so
restart Neovim after editing it by hand.

## `:MP list_devices`

Lists every serial device that's connected, with its port, serial number and manufacturer, in a
notification. It shows all serial devices mpremote can see, not only ones running MicroPython.
