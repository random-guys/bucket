#! /usr/bin/env node

const program = require("commander");
const migrate = require("../dist/migration");
const pkgjson = require("../package.json");

program.version(pkgjson.version);

program
  .command("init")
  .description("initialize a new migration project")
  .action(() =>
    migrate
      .init()
      .then(() => console.log(`Initialization successful. Check out \`${migrate.DEFAULT_CONFIG_FILE_NAME}\` file`))
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
      })
  );

program
  .command("create [description]")
  .description("create a new database migration with the provided description")
  .action((description, options) => {
    global.options = options;
    migrate
      .create(description)
      .then(destination => console.log(`Created: ${destination}`))
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
      });
  });

program.parse(process.argv);

if (!program.rawArgs || program.rawArgs.length === 0) {
  program.outputHelp();
}
