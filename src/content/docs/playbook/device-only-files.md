---
title: Editing a file that only exists on the device
description: Open a file stored on the device, change it, and save it straight back, without it being in your project.
sidebar:
  order: 5
---

## Situation

Some files live only on the **device**: a `config.json` with your Wi-Fi name, a log your
program writes, or the files a board came with. They aren't in your **project**, so
**[uploading](/commands/running-code/#mp-upload)** can't change them. You want to open one,
change it, and save it back, and keep a copy in the project if it's worth keeping.

## What you'll use

- [`:MP files`](/commands/files/#mp-files) to browse the device and open files from it
- [`mp://` buffers](/commands/files/#editing-device-files), which read from and write to the
  device
- `D` in [the browser](/commands/files/#mp-files) to download a file into the project
- [`:MP hard_reset`](/commands/device-and-firmware/#mp-hard_reset) to restart the device with
  the change

## Steps

### 1. Free the port

Every step here talks to the device over its **port**, which only one program can use at a
time. If the **[REPL](/commands/repl/)** is open, go to it and press `Ctrl-]`. Close anything
else using the port too: see [freeing the port](/playbook/stuck-device/#1-check-its-the-device-not-the-port).

### 2. Open the browser

```vim
:MP files
```

**You should see** `Loading device files…`, then the device's files as a tree, with sizes and
the device's free space on the first line:

```
Device auto  ·  1.3 MB free of 1.4 MB
<CR> open  d delete  D download  a mkdir  u upload  R refresh  q close

config.json          52 B
lib/
  ssd1306.mpy      2.9 KB
main.py             512 B
```

### 3. Open the file

Move to `config.json` and press `<CR>`.

**You should see** a buffer named `mp://config.json` with the file's contents, and the usual
syntax highlighting for its type. It's read from the device in the background, so a large file
takes a moment to appear.

If you know the path, you can skip the browser:

```vim
:e mp://config.json
```

### 4. Change it and save

Edit the file as normal, then `:w`.

**You should see** `Write config.json started`, then `Write config.json completed successfully`.
The device's copy now has your change. Nothing was written to your project.

`:wq` and quitting Neovim are safe: Neovim waits for writes still in progress before it exits.

### 5. Try the change

Restart the device so your program reads the new file:

```vim
:MP hard_reset
```

**You should see** `Hard reset completed successfully`, and the device starting up with the new
settings.

### 6. Keep a copy, if you want one

Run `:MP files` again, move to `config.json` and press `D`.

**You should see** `Download config.json started`, then
`Download config.json completed successfully`. The file is now in your project at the same path,
`config.json`. If the project already has a file there, the plugin asks before overwriting it.

From now on it's a project file like any other: [upload on
save](/commands/running-code/#upload-on-save) and
[`:MP upload_all`](/commands/running-code/#mp-upload_all) send your local copy to the device.
Don't commit it if it holds passwords.

## What can go wrong

**`Failed to list device files`, or `Could not list device files. Press R to retry.`**
Something else holds the port: [free it](/playbook/stuck-device/#1-check-its-the-device-not-the-port), then press `R`. If nothing else is using it, the device may be busy running code that
won't stop: see [The device is stuck](/playbook/stuck-device/).

**`Failed to read config.json from the device`, and the buffer is empty.** The buffer is left
read-only, and if you force a write you get `config.json was not loaded from the device, so it
was not written`: an empty buffer never replaces the device's file. Free the port, close the
buffer with `:bd`, and open the file again.

**`… looks like a binary file and cannot be edited`.** `mp://` buffers are for text. Compiled
`.mpy` files, images and fonts can only be downloaded (`D`) or deleted (`d`).

**`Write config.json failed`.** The buffer is marked as changed again, so your edit isn't lost.
Free the port and `:w` again. On a board with **custom firmware**, some folders can be
read-only: copy the file somewhere writable instead.

**You can't create a new file with `:e mp://new.py`.** The plugin can only open files that are
already on the device. Write the file in your project instead, save it, then either
[upload](/commands/running-code/#mp-upload) it or open `:MP files` from it and press `u` on the
folder you want it in.

**The browser still shows the old size.** It doesn't refresh after an `mp://` write. Press `R`.
