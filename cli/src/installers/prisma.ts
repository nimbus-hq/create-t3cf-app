import path from "path";
import fs from "fs-extra";
import { type PackageJson } from "type-fest";

import { PKG_ROOT } from "~/consts.js";
import { type Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const prismaInstaller: Installer = ({
  projectDir,
  packages,
  databaseProvider,
}) => {
  addPackageDependency({
    projectDir,
    dependencies: ["prisma"],
    devMode: true,
  });
  addPackageDependency({
    projectDir,
    dependencies: ["@prisma/client"],
    devMode: false,
  });
  if (databaseProvider === "turso")
    addPackageDependency({
      projectDir,
      dependencies: ["@prisma/adapter-libsql", "@libsql/client"],
      devMode: false,
    });
  if (databaseProvider === "planetscale")
    addPackageDependency({
      projectDir,
      dependencies: ["@prisma/adapter-planetscale", "@planetscale/database"],
      devMode: false,
    });

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  let prefix: string;
  let name = "";
  packages?.nextAuth.inUse ? (prefix = "with-auth") : (prefix = "base");
  switch (databaseProvider) {
    case "planetscale":
      name = "-planetscale";
      break;
    case "turso":
      name = "-turso";
      break;
  }
  const schema = prefix + name + ".prisma";

  const schemaSrc = path.join(extrasDir, "prisma/schema", schema);
  let schemaText = fs.readFileSync(schemaSrc, "utf-8");
  if (databaseProvider !== "sqlite" && databaseProvider !== "turso") {
    schemaText = schemaText.replace(
      'provider = "sqlite"',
      `provider = "${
        {
          mysql: "mysql",
          postgres: "postgresql",
          planetscale: "mysql",
        }[databaseProvider]
      }"`
    );
    if (["mysql", "planetscale"].includes(databaseProvider)) {
      schemaText = schemaText.replace("// @db.Text", "@db.Text");
    }
  }
  const schemaDest = path.join(projectDir, "prisma/schema.prisma");
  fs.mkdirSync(path.dirname(schemaDest), { recursive: true });
  fs.writeFileSync(schemaDest, schemaText);

  let dbFilePath: string;
  switch (databaseProvider) {
    case "planetscale":
      dbFilePath = "src/server/db/db-prisma-planetscale.ts";
      break;
    case "turso":
      dbFilePath = "src/server/db/db-prisma-turso.ts";
      break;
    default:
      dbFilePath = "src/server/db/db-prisma.ts";
  }

  const clientSrc = path.join(extrasDir, dbFilePath);
  const clientDest = path.join(projectDir, "src/server/db.ts");

  // add postinstall and push script to package.json
  const packageJsonPath = path.join(projectDir, "package.json");

  const packageJsonContent = fs.readJSONSync(packageJsonPath) as PackageJson;
  packageJsonContent.scripts = {
    ...packageJsonContent.scripts,
    postinstall: "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma migrate dev",
    "db:migrate": "prisma migrate deploy",
  };

  fs.copySync(clientSrc, clientDest);
  fs.writeJSONSync(packageJsonPath, packageJsonContent, {
    spaces: 2,
  });
};
