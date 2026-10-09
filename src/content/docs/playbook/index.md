---
title: Playbook
description: Walkthroughs of everyday situations, from a brand-new board to poking at hardware live.
sidebar:
  order: 0
---

The [Commands](/commands/) section tells you what each command does. The Playbook shows how they
fit together: each entry takes one real situation from start to finish.

## How entries are laid out

Every entry has the same four parts:

- **Situation**: where you're starting from and what you want to end up with.
- **What you'll use**: the commands involved, each linked to its reference section.
- **Steps**: what to do, in order, with the `:MP` command to run and what you should see.
- **What can go wrong**: the problems you're most likely to hit, and how to get past them.

The steps use a Raspberry Pi Pico running official MicroPython. Most of them work the same on
other boards; where one doesn't, the entry says so. For a board whose firmware isn't official
MicroPython, see [A board with custom firmware](/playbook/custom-firmware/).

## Entries

| Entry | Situation |
|-------|-----------|
| [A brand-new Pico](/playbook/brand-new-pico/) | A Pico straight out of the bag, to a blinking LED from your own project |
| [The fast edit loop](/playbook/fast-edit-loop/) | Change code and see it on the device in seconds, with upload on save or a mount |
| [Poking at hardware live](/playbook/hardware-live/) | Try out pins and sensors line by line from your buffer, in the REPL |
| [Adding a library and getting completions](/playbook/library-and-completions/) | Install a driver onto the device with mip, and stubs into the project for your editor |
| [Editing a file that only exists on the device](/playbook/device-only-files/) | Open a device file, change it and save it straight back |
| [The device is stuck](/playbook/stuck-device/) | Get an unresponsive device back, from the gentlest fix to reflashing |
| [A board with custom firmware](/playbook/custom-firmware/) | Work with a Pimoroni Badger 2350, and what changes when the firmware isn't official MicroPython |
| [Moving a v2 project to v3](/playbook/v2-project/) | Upgrade a project made with plugin v2, from its config files to the code on the device |
