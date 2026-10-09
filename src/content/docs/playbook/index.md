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
other boards; where one doesn't, the entry says so.

## Entries

| Entry | Situation |
|-------|-----------|
| [A brand-new Pico](/playbook/brand-new-pico/) | A Pico straight out of the bag, to a blinking LED from your own project |
| [The fast edit loop](/playbook/fast-edit-loop/) | Change code and see it on the device in seconds, with upload on save or a mount |
| [Poking at hardware live](/playbook/hardware-live/) | Try out pins and sensors line by line from your buffer, in the REPL |
