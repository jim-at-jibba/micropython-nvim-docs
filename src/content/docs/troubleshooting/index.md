---
title: Troubleshooting
description: What to do when the device, port, upload or completions don't behave, by symptom.
---

Find the symptom closest to yours. Each entry says what's going on and which `:MP` command
fixes it. For a device that has stopped answering altogether, work through
[The device is stuck](/playbook/stuck-device/).

## Start with the health check

```vim
:checkhealth micropython_nvim
```

[`:MP health`](/commands/project-and-stubs/#mp-health) runs the same thing. It has three
sections: your tools, the **project**, and the **device**. Lines marked `OK` are fine. For the
others:

| It says | What to do |
|---------|------------|
| `mpremote not found` | Install it: `uv tool install mpremote` or `pip install mpremote`. In a project with `pyproject.toml`, run [`:MP install`](/commands/project-and-stubs/#mp-install) instead: the plugin runs mpremote through `uv run` there, from the project's environment. |
| `mpremote could not be run: …` | mpremote is there but fails to start. Read the error after the colon. In a uv project, run `:MP install` to repair its environment. |
| `uv not found; needed for :MP init and :MP install` | Install [uv](https://docs.astral.sh/uv/) if you want those commands. Everything else works without it. |
| `mpflash not found (optional, for :MP flash)` | Only matters for [`:MP flash`](/commands/device-and-firmware/#mp-flash). Install it with `uv tool install mpflash`. |
| `snacks.nvim not installed (optional)` | Nothing to do: the plugin uses Neovim's own terminal and `vim.ui.select`. |
| `No project config in …` | Neovim wasn't opened in a project. Open it at the project's top folder, or run [`:MP init`](/commands/project-and-stubs/#mp-init) to make this folder one. |
| `No MicroPython device found` | See [No device found](#no-device-found). |
| `Configured port … is not connected` | See [The port I set is wrong or ignored](#the-port-i-set-is-wrong-or-ignored). |
| `Could not list devices: …` | mpremote failed while looking for devices. Read its error after the colon. |

When you report a bug, include this output and the output of `:messages`.

## No device found

You see `no device found` from a command, `No MicroPython devices found` from
[`:MP list_devices`](/commands/ports/#mp-list_devices), or `No MicroPython device found` in the
health check.

- **The port is busy.** With port `auto`, mpremote skips ports another program is using, so a
  busy device looks like a missing one. See [The port is busy](#the-port-is-busy).
- **The cable only carries power.** Many USB cables have no data wires. Try another one.
- **The board has no MicroPython yet, or is in its bootloader.** A board in bootloader mode
  shows up as a drive, such as `RPI-RP2` on a Pico, not as a serial port. Install MicroPython:
  see [A brand-new Pico](/playbook/brand-new-pico/#1-install-micropython).
- **On Linux, you can't open serial ports.** Add yourself to the `dialout` group (`uucp` on
  some distributions), then log out and back in.
- **The device is asleep or restarting.** Wait a few seconds, or press its reset button, then
  try again.

## The port is busy

mpremote says `failed to access … (it may be in use by another program)`, or a command fails
straight away while the device is plugged in.

A device's **port** can only be used by one program at a time. Look for:

- the **[REPL](/commands/repl/)**: go to its split and press `Ctrl-]`. Closing the window only hides
  it, and it keeps the port.
- a [`:MP run`](/commands/running-code/#mp-run) terminal that's still running: press `Ctrl-C`
- a [mount](/commands/running-code/#mp-mount): press `Ctrl-]` in its terminal
- another program: Thonny, a serial monitor, or mpremote in another terminal

While the REPL is open, [`:MP run`](/commands/running-code/#mp-run) and
[`:MP run_main`](/commands/running-code/#mp-run_main) run in it, and
[`:MP flash`](/commands/device-and-firmware/#mp-flash) closes it first. Every other device
command needs the REPL closed.

The same error also appears when the configured port doesn't exist, for example after the
device came back on a different port. See the next section.

## The port I set is wrong or ignored

**The device moved to another port.** Ports such as `/dev/ttyACM0` can change when you plug a
device into another USB socket, or plug in a second device. Run
[`:MP set_port`](/commands/ports/#mp-set_port) and pick it again, or use port
`id:<serial>`, which finds the device by its serial number on any port. See
[Ports](/commands/ports/).

**More than one device is plugged in.** Port `auto` picks the first one mpremote finds, which
may not be the one you want. Pick yours with `:MP set_port`.

**The port isn't remembered after a restart.**

- `:MP set_port` says `No config file found. Run :MP init first.` The folder isn't a project,
  so there's nowhere to save the port. Run `:MP init`, then `:MP set_port` again.
- `setup()` isn't called in your Neovim config, so `.micropython` is never read. See
  [`setup()` options](/configuration/#setup-options).
- Neovim was opened in a subfolder of the project. `.micropython` is only read from the folder
  Neovim was opened in.
- `.micropython` has no `PORT=` line, so `:MP set_port` had nothing to replace. Add
  `PORT=auto` and pick the port again.

**You edited `.micropython` by hand and nothing changed.** It's only read when Neovim starts.
Restart Neovim.

## The device doesn't respond

Commands hang or fail with `could not enter raw repl`, the REPL shows no `>>>` prompt, or a
program on the device won't stop.

Try these in order, and stop when one works:

1. [`:MP repl`](/commands/repl/#mp-repl), then [`:MP interrupt`](/commands/repl/#mp-interrupt)
   to **interrupt** the running code. Quit the REPL with `Ctrl-]` afterwards.
2. [`:MP reset`](/commands/device-and-firmware/#mp-reset) for a **soft reset**.
3. [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset), or unplug the device and
   plug it back in.

If it gets stuck again after every restart, the device's own `main.py` is the problem.
[The device is stuck](/playbook/stuck-device/) goes from there to erasing files and reflashing.

## A file didn't upload, or the old version still runs

You **uploaded** a file, but the device doesn't have it, or still runs the old version.

**It's on the ignore list.** [`:MP upload_all`](/commands/running-code/#mp-upload_all) and
upload on save skip anything on the **[ignore list](/configuration/#the-ignore-list)**, by name at
any depth. A folder called `env`, or a `README.md` inside `lib/`, is skipped too. Upload it
with [`:MP upload`](/commands/running-code/#mp-upload), which ignores the list, or rename it.
Turn on `debug` in [`setup()`](/configuration/#setup-options) to see what an upload skipped in
`:messages`.

**Upload on save didn't upload it.** Check that:

- `upload_on_save = true` is in your `setup()` call
- Neovim was opened in the project's top folder, and the file is inside it
- the [REPL](/commands/repl/) isn't open. It holds the port, so uploads fail until you quit
  it.

**It uploaded, but the device still runs the old code.** Uploading doesn't restart anything.
Run [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) to start the device's
`main.py` again, or [`:MP run_main`](/commands/running-code/#mp-run_main) to run your project's
`main.py` without restarting.

**It's in the wrong place on the device.** Uploads keep the file's path in the project:
`lib/led.py` goes to `lib/led.py` on the device. A file from outside the project goes to the
device's top folder. Check where things are with [`:MP files`](/commands/files/#mp-files).

**`No files to upload`.** Everything in the folder is on the ignore list, or Neovim wasn't
opened in the project.

## No completions, or `machine` is flagged as missing

The completions come from **stubs** in your project's `typings/` folder.

- **They aren't installed**, which is normal after cloning a project, because `typings/` isn't
  committed. Run [`:MP install`](/commands/project-and-stubs/#mp-install).
- **`:MP install` stops at `Dependencies installed`.** The project doesn't declare any stubs.
  Run [`:MP set_stubs`](/commands/project-and-stubs/#mp-set_stubs), and add the package it
  names to your dev dependencies.
- **Your language server doesn't read `typings/`.** The plugin sets up
  [pyright](https://github.com/microsoft/pyright) and basedpyright, through
  `pyrightconfig.json`. If your pyright settings live in `pyproject.toml` instead, add
  `stubPath = "typings"` under `[tool.pyright]`. Other Python language servers need their own
  setup.
- **They're for the wrong board.** Completions offer pins or functions your board doesn't have.
  Run `:MP set_stubs` with the device connected and pick the first suggestion.
- **The module is a package you installed with [mip](/commands/device-and-firmware/#mp-mip).** Stubs don't cover those. See
  [Adding a library and getting completions](/playbook/library-and-completions/#what-can-go-wrong).

After changing stubs, restart your language server, or Neovim, if it doesn't pick them up.

## `Not an editor command: MPRun`

You're on v3, which replaced the `:MPxxx` commands with `:MP <subcommand>`: `:MPRun` is now
`:MP run`. See [Migrating from v2](/migrating-from-v2/#commands) for the full list.

`Unknown subcommand "…"` means `:MP` didn't recognise the name. The message lists the ones it
knows, and `:MP <Tab>` completes them.

## A terminal closed before I could read it

Most terminals wait for Enter, with `Please Press ENTER to continue`, before closing. Without
snacks.nvim, the built-in terminal also stays open if the command fails. If a message went by
too quickly as a notification, `:messages` shows it again.
