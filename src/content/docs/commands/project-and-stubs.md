---
title: Project and stubs
description: Create a project, install its dependencies and type stubs, and check your setup.
sidebar:
  order: 5
---

A **project** is the folder you open Neovim in. **Stubs** are type-only packages that describe
a device's MicroPython modules, such as `machine` and `rp2`, so your language server can
complete and check code written for it. They're installed into the project's `typings/` folder
and never **uploaded** to the device.

## `:MP init`

Creates a new project in the current folder. With a device connected, it reads the device's board and
MicroPython version and suggests matching stubs first: the board's own package if one is
published, then the package for its port, each checked against PyPI. Without a device, or to
choose something else, pick from the full list below the suggestions. Reading the device needs
the port, so with the [REPL](/commands/repl/) open you only get the full list.

It then writes:

| File | What it's for |
|------|---------------|
| `main.py` | A starter program that blinks the board's LED |
| `.micropython` | Project settings; starts as `PORT=auto` |
| `pyproject.toml` | Python dependencies (mpremote and ruff), with the stubs as a dev dependency |
| `pyrightconfig.json` | Points pyright at the stubs in `typings/` |
| `.gitignore` | Keeps `.venv/`, `typings/` and Python caches out of git |

If any of these files already exist, it asks once before overwriting. Answering yes replaces
all five, including your `main.py`, and resets `.micropython` to `PORT=auto`. Finally it offers to run
`uv sync`, which does the same as `:MP install`.

## `:MP install`

Installs the project's Python dependencies with `uv sync`, then installs the stubs into
`typings/`, in the background. Needs [uv](https://docs.astral.sh/uv/) and a `pyproject.toml`.

Run it after cloning a project, or if you skipped the install when running `:MP init`. Stubs
are only installed if a `micropython-…-stubs` package is declared in the project.

## `:MP set_stubs`

Switches the project to different stubs, using the same suggestions as `:MP init`. Use it after
[flashing](/commands/device-and-firmware/#mp-flash) a new firmware version, or when you move the
project to a different board.

It replaces the stubs declared in `pyproject.toml` (or `requirements.txt`). If none are
declared, it tells you which package to add and stops. Otherwise it installs them into
`typings/`, and makes sure pyright looks there: it adds `stubPath` to `pyrightconfig.json`, or
creates the file, unless `pyproject.toml` has a `[tool.pyright]` section. In that case, set
`stubPath = "typings"` there yourself.

Without uv, install the stubs yourself with `pip install --target typings <stubs package>`.

## `:MP health`

Runs `:checkhealth micropython_nvim`, which checks:

- your Neovim version (0.9 or later)
- mpremote, which is required, and uv, which `:MP init` and `:MP install` need
- mpflash and snacks.nvim, which are optional
- whether the current folder is a project
- whether a device is connected on the configured **port**

Missing tools come with a hint on how to install them.
