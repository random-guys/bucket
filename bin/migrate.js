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
      .then(() => console.log(`Initialization successful. Check out \`${migrate.config.getConfigFilename()}\` file`))
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
      })
  );

program
  .command("create [description]")
  .description("create a new database migration with the provided description")
  .option("-f --file <file>", "use a custom config file")
  .action((description, options) => {
    global.options = options;
    migrate
      .create(description)
      .then(fileName =>
        migrate.config.read().then(config => {
          console.log(`Created: ${config.migrationsDir}/${fileName}`);
        })
      )
      .catch(err => {
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
      });
  });

program.parse(process.argv);

if (_.isEmpty(program.rawArgs)) {
  program.outputHelp();
}
