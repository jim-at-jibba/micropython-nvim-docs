---
title: All commands
description: Every :MP command at a glance, grouped by what you're doing.
sidebar:
  order: 0
---

Everything in micropython.nvim is one command, `:MP`, followed by a subcommand: `:MP run`,
`:MP upload`, `:MP repl` and so on.

- Type `:MP <Tab>` to complete a subcommand. `:MP mip` and `:MP flash` also complete their
  first argument.
- Run `:MP` on its own to pick a subcommand from a list. Commands picked this way run without
  arguments.
- Only `:MP send` takes a line range, as in `:'<,'>MP send`.

## At a glance

| Command | What it does |
|---------|--------------|
| **[Running code](/commands/running-code/)** | |
| [`:MP run`](/commands/running-code/#mp-run) | **Run** the current file on the **device** without uploading it |
| [`:MP run_main`](/commands/running-code/#mp-run_main) | Run the **project**'s `main.py` from any buffer |
| [`:MP upload`](/commands/running-code/#mp-upload) | **Upload** the current file, keeping its project path |
| [`:MP upload_all`](/commands/running-code/#mp-upload_all) | Upload the whole project, skipping unchanged files |
| [`:MP mount`](/commands/running-code/#mp-mount) | **Mount** the project on the device without copying anything |
| **[REPL](/commands/repl/)** | |
| [`:MP repl`](/commands/repl/#mp-repl) | Open or focus the **REPL** split |
| [`:MP send`](/commands/repl/#mp-send) | **Send** the current line, or a range of lines, to the REPL |
| [`:MP send_buffer`](/commands/repl/#mp-send_buffer) | Send the whole buffer to the REPL |
| [`:MP interrupt`](/commands/repl/#mp-interrupt) | **Interrupt** code running in the REPL (Ctrl-C) |
| **[Files on the device](/commands/files/)** | |
| [`:MP files`](/commands/files/#mp-files) | Browse, open, edit, download and delete **device files** |
| [`:MP list_files`](/commands/files/#mp-list_files) | Print the device's files as a tree |
| [`:MP erase`](/commands/files/#mp-erase) | **Erase** one file or folder at the top of the device |
| [`:MP erase_all`](/commands/files/#mp-erase_all) | Erase every file on the device |
| **[Device and firmware](/commands/device-and-firmware/)** | |
| [`:MP info`](/commands/device-and-firmware/#mp-info) | Show the firmware, board, storage and clock, and set the clock |
| [`:MP reset`](/commands/device-and-firmware/#mp-reset) | **Soft reset** the device |
| [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) | **Hard reset** the device |
| [`:MP mip`](/commands/device-and-firmware/#mp-mip) | Install a package on the device with **mip** |
| [`:MP flash`](/commands/device-and-firmware/#mp-flash) | Install or update MicroPython **firmware** with mpflash |
| **[Project and stubs](/commands/project-and-stubs/)** | |
| [`:MP init`](/commands/project-and-stubs/#mp-init) | Create a new project with **stubs** for the connected device |
| [`:MP install`](/commands/project-and-stubs/#mp-install) | Install the project's Python dependencies and stubs |
| [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs) | Switch the project to different stubs |
| [`:MP health`](/commands/project-and-stubs/#mp-health) | Check your setup with `:checkhealth` |
| **[Ports](/commands/ports/)** | |
| [`:MP set_port`](/commands/ports/#mp-set_port) | Choose the **port** the device is on |
| [`:MP list_devices`](/commands/ports/#mp-list_devices) | List the serial devices that are connected |

## How commands run

Commands run in one of three ways:

- **In the background.** Uploads, resets, `mip` and similar commands show a notification when
  they start and another when they finish. If one fails, the notification includes mpremote's
  error.
- **In a terminal.** `run`, `mount`, `list_files`, `erase_all` and `flash` open a terminal so you
  can watch the output and type into it. Most wait for Enter before closing, so you can read the
  result.
- **In a window or picker.** `files`, `info`, `erase` and `set_port` open a window or a list to
  choose from.

Terminals and pickers use [snacks.nvim](https://github.com/folke/snacks.nvim) when it's
installed. Otherwise terminals open in a floating window, and pickers use `vim.ui.select`. In
the floating terminal, `<Esc><Esc>` leaves terminal mode and `q` closes it.

## The REPL holds the port

Only one program can use a device's serial port at a time. While the [REPL](/commands/repl/)
is open, it holds the port:

- `:MP run` and `:MP run_main` run your code in the open REPL instead of starting mpremote.
- `:MP flash` closes the REPL before it starts.
- Every other command that talks to the device needs the port for itself. Quit the REPL with
  `Ctrl-]` before using them.
