---
title: REPL
description: Keep the MicroPython prompt open in a split and send it code from your buffers.
sidebar:
  order: 2
---

The **REPL** is the interactive MicroPython prompt on the **device**. micropython.nvim keeps it
open in a split at the bottom of the screen, so you can try code next to the file you're
writing.

While the REPL is open it holds the device's **port**. `:MP run` and `:MP run_main` run your code
through it, and `:MP flash` closes it, but other device commands can't reach the device until
you quit the REPL with `Ctrl-]`.

Suggested keymaps:

```lua
local mp = require("micropython_nvim")
vim.keymap.set("n", "<leader>mp", mp.repl, { desc = "MicroPython: REPL" })
vim.keymap.set("n", "<leader>ml", mp.repl_send_line, { desc = "MicroPython: send line" })
vim.keymap.set("x", "<leader>ms", mp.repl_send_selection, { desc = "MicroPython: send selection" })
vim.keymap.set("n", "<leader>mb", mp.repl_send_buffer, { desc = "MicroPython: send buffer" })
vim.keymap.set("n", "<leader>mc", mp.repl_interrupt, { desc = "MicroPython: stop running code" })
```

## `:MP repl`

Opens the REPL in a split at the bottom, or jumps to it if it's already open.

- `<Esc><Esc>` leaves terminal mode so you can move back to your code.
- Closing the split's window only hides it: the REPL keeps running, and `:MP repl` brings back
  the same session.
- `Ctrl-]` quits the REPL and frees the port.

The REPL always opens in Neovim's own terminal, even when snacks.nvim is installed.

## `:MP send`

**Sends** the line under the cursor to the REPL. Give it a range to send several lines:

```vim
:MP send            " the current line
:'<,'>MP send       " the visual selection, as whole lines
:10,20MP send       " lines 10 to 20
```

It opens the REPL if needed, and keeps you in your buffer.

- A simple line is typed in as if you'd entered it.
- Several lines, or one line that starts a block, such as `for i in range(3): print(i)`, are
  sent in paste mode, so the REPL's auto-indent doesn't change them.
- Indentation the lines all share is removed, so you can send the body of a function on its own.
- In paste mode the REPL doesn't echo values: sending `x` on its own line prints its value, but
  sending it as part of several lines doesn't. Use `print(x)` there.

## `:MP send_buffer`

Sends the whole buffer to the REPL, the same way as `:MP send`. Unlike
[`:MP run`](/commands/running-code/#mp-run), it doesn't stop code that's already running first.

## `:MP interrupt`

**Interrupts** whatever is running in the REPL (Ctrl-C) without resetting the device, and
drops anything still waiting to be sent. Variables and imported modules are kept.

It only works while the REPL is open; otherwise it warns
`The REPL is not open. Run :MP repl first.` To stop code started with `:MP run` outside the
REPL, press `Ctrl-C` in its terminal.

:::tip[Interrupt or reset?]
**Interrupt** stops the running code and keeps the REPL's state. A **soft reset** (`Ctrl-D` in
the REPL, or [`:MP reset`](/commands/device-and-firmware/#mp-reset) with the REPL closed) also
stops it, but clears everything and restarts the interpreter.
:::
