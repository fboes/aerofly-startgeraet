#!/usr/bin/env node

import { Config } from "./model/Config.js";
import { Controller } from "./controller/Controller.js";
import { CliMenu, CliMenuMethod, Cli, CliSetup } from "./interaction/Cli.js";

const config = new Config();

try {
  const controller = new Controller(config);
  const startgeraet = new CliMenu(controller);

  process.stdout.write("\x1Bc");
  let next: CliMenuMethod = "mainMenu";
  while (next !== "exit") {
    try {
      next = await startgeraet[next]();
    } catch (error) {
      if (error instanceof Error && error.name === "ExitPromptError") {
        next = "exit";
      } else {
        next = "mainMenu";
        Cli.writeCatch(error);
      }
    }

    process.stdout.write("\n");
  }
} catch (error) {
  Cli.writeCatch(error);

  const setup = new CliSetup(config);
  await setup.setup();

  process.stdout.write(`\

You will also need to restart the application after changing the
configuration to apply the changes.`);
}

process.stdout.write("Goodbye\n");
