import path from "path";
import fs from "fs-extra";

import { PKG_ROOT } from "~/consts.js";
import { type DatabaseProvider, type Installer } from "~/installers/index.js";

export const envVariablesInstaller: Installer = ({
  projectDir,
  packages,
  databaseProvider,
  scopedAppName,
}) => {
  const usingAuth = packages?.nextAuth.inUse;
  const usingPrisma = packages?.prisma.inUse;
  const usingDrizzle = packages?.drizzle.inUse;

  const usingDb = usingPrisma || usingDrizzle;
  const usingPlanetScale = databaseProvider === "planetscale";
  // const usingLiqsql = databaseProvider === "sqlite";
  const usingTurso = databaseProvider === "turso";

  const envContent = getEnvContent(
    !!usingAuth,
    !!usingPrisma,
    !!usingDrizzle,
    databaseProvider,
    scopedAppName
  );

  let envFile = "";
  if (usingDb) {
    if (usingPlanetScale) {
      if (usingAuth) envFile = "with-auth-db-planetscale.js";
      else envFile = "with-db-planetscale.js";
    } else if (usingTurso) {
      if (usingAuth) envFile = "with-auth-db-libsql.js";
      else envFile = "with-db-libsql.js";
    } else {
      if (usingAuth) envFile = "with-auth-db.js";
      else envFile = "with-db.js";
    }
  } else {
    if (usingAuth) envFile = "with-auth.js";
  }

  if (envFile !== "") {
    const envSchemaSrc = path.join(
      PKG_ROOT,
      "template/extras/src/env",
      envFile
    );
    const envSchemaDest = path.join(projectDir, "src/env.js");
    fs.copyFileSync(envSchemaSrc, envSchemaDest);
  }

  const devVarsDest = path.join(projectDir, ".dev.vars");
  const envExampleDest = path.join(projectDir, ".dev.vars.example");

  fs.writeFileSync(devVarsDest, devVarsContent + envContent, "utf-8");
  fs.writeFileSync(envExampleDest, exampleDevVarsContent + envContent, "utf-8");
};

const getEnvContent = (
  usingAuth: boolean,
  usingPrisma: boolean,
  usingDrizzle: boolean,
  databaseProvider: DatabaseProvider,
  scopedAppName: string
) => {
  let content = `
# When adding additional environment variables, the schema in "/src/env.js"
# should be updated accordingly.
`
    .trim()
    .concat("\n");

  if (usingPrisma)
    content += `
# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
`;

  if (usingDrizzle) content += "\n# Drizzle\n";

  if (usingPrisma || usingDrizzle) {
    if (databaseProvider === "planetscale") {
      if (usingDrizzle) {
        content += `# Get the Database URL from the "prisma" dropdown selector in PlanetScale. 
# Change the query params at the end of the URL to "?ssl={"rejectUnauthorized":true}"
DATABASE_URL='mysql://YOUR_MYSQL_URL_HERE?ssl={"rejectUnauthorized":true}'`;
      } else {
        content = `# Get the Database URL from the "prisma" dropdown selector in PlanetScale. 
DATABASE_URL='mysql://YOUR_MYSQL_URL_HERE?sslaccept=strict'`;
      }
    } else if (databaseProvider === "mysql") {
      content += `DATABASE_URL="mysql://root:password@localhost:3306/${scopedAppName}"`;
    } else if (databaseProvider === "postgres") {
      content += `DATABASE_URL="postgresql://postgres:password@localhost:5432/${scopedAppName}"`;
    } else if (databaseProvider === "turso" || databaseProvider === "sqlite") {
      if (usingDrizzle) {
        content += `# The @libsql/client/web does not support local file URLs.
# You can run the sqlite database using "./start-database.sh"
DATABASE_URL="http://127.0.0.1:8080"
# Auth tokens aren't necessary when developing with local database
# DATABASE_AUTH_TOKEN="your-auth-token-here"`;
      } else if (databaseProvider === "turso") {
        content += `# The @libsql/client/web does not support local file URLs.
# Due to limitations of Prisma and the libsql client you can only use actual
# Turso databases currently, you cannot run against a local one.
DATABASE_URL="libsql://<db>-<username>.turso.io"
DATABASE_AUTH_TOKEN="your-auth-token-here"`;
      } else {
        content += `DATABASE_URL="file:./db.sqlite"`;
      }
    }
    content += "\n";
  }

  if (usingAuth)
    content += `
# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
# NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=http://localhost:3000

# Next Auth Discord Provider
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
`;

  if (!usingAuth && !usingPrisma)
    content += `
# Example:
# SERVERVAR="foo"
# NEXT_PUBLIC_CLIENTVAR="bar"
`;

  return content;
};

const devVarsContent = `
# Wrangler, the tool used to emulate the actual cloudflare runtime does not
# read environment variables from .env, as a result you need to write
# your environment variables to this file before you run your app.
`

  .trim()
  .concat("\n\n");

const exampleDevVarsContent = `
# Since the ".dev.vars" file is gitignored, you can use the ".dev.vars.example" file to
# build a new ".dev.vars" file when you clone the repo.

# This file will be committed to version control, so make sure not to have any
# secrets in it. If you are cloning this repo, create a copy of this file named
# ".dev.vars" and populate it with your secrets.
`
  .trim()
  .concat("\n\n");
