const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function runSeeders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true,
  });

  const seedersPath = path.join(__dirname, "../seeders");

  const files = fs
    .readdirSync(seedersPath)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(seedersPath, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Ejecutando seeder: ${file}`);

    await connection.query(sql);
  }

  console.log("Seeders completados correctamente.");

  await connection.end();
}

runSeeders().catch((error) => {
  console.error("Error ejecutando seeders:", error);
  process.exit(1);
});