---
title: Files on the device
description: Browse, edit, download and erase the files stored on the device.
sidebar:
  order: 3
---

**Device files** are the files stored on the **device**'s own filesystem, as opposed to the
files in your **project**. These commands work on them directly. To copy project files onto the
device, see [Upload](/commands/running-code/#mp-upload).

All of them, including writing an `mp://` buffer, need the port: quit the
[REPL](/commands/repl/) first.

:::tip[files or list_files?]
`:MP files` is a browser you can act in: open, edit, download, delete and create.
`:MP list_files` just prints the tree in a terminal, which is quicker when you only want to look.
:::

:::tip[erase or erase_all?]
`:MP erase` deletes **one** file or folder that you pick from the top of the device.
`:MP erase_all` deletes **everything**. Neither asks you to confirm, and **erasing** never touches
your project. To delete something deeper in the tree, use `d` in `:MP files`, which does ask.
:::

## `:MP files`

Opens a browser showing the device's filesystem as a tree, with file sizes and the free space
on the device. It loads in the background, so Neovim stays responsive while the device answers.

| Key | Action |
|-----|--------|
| `<CR>` | Open the file under the cursor for editing |
| `d` | Delete the file or folder under the cursor (asks first) |
| `D` | Download the file under the cursor into the project, at the same path |
| `a` | Create a folder inside the folder under the cursor |
| `u` | Upload the file you opened the browser from into the folder under the cursor (save it first) |
| `R` | Refresh |
| `q` | Close |

Keys that act on a folder use the folder under the cursor, or the folder of the file under the
cursor. On the header lines they use the root of the device.

### Editing device files

A device file opens in an `mp://<path>` buffer. Edit it and `:w` writes it straight back to the
device. You can also open one directly:

```vim
:e mp://lib/led.py
```

Binary files can't be edited. If a file can't be read, its buffer stays read-only, so `:w` can
never replace a device file with an empty one. When you quit Neovim, it waits for writes that
are still in progress.

## `:MP list_files`

Prints every file and folder on the device as a tree (`mpremote tree`), in a terminal.

## `:MP erase`

Lists the files and folders at the top of the device and **erases** the one you pick. A folder
is deleted with everything in it. It runs in the background as soon as you pick, without asking
again.

## `:MP erase_all`

Erases every file and folder on the device, in a terminal. It starts straight away, without
asking you to confirm.

The **firmware** isn't affected: MicroPython keeps running, it just has no files. On boards with
**custom firmware**, parts of the filesystem may be read-only, and `erase_all` can stop with an
error when it reaches them.
