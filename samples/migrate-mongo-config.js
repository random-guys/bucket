// In this file you can configure migrate-mongo

const config = {
  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "dist/migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js"
};

// Return the config as a promise
module.exports = config;
