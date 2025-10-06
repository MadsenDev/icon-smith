export type MysqlDefaultType = "none" | "value" | "expression";

export type MysqlColumnDefinition = {
  id: string;
  name: string;
  type: string;
  length?: string;
  unsigned: boolean;
  nullable: boolean;
  autoIncrement: boolean;
  primaryKey: boolean;
  defaultType: MysqlDefaultType;
  defaultValue: string;
};

export type MysqlTableDefinition = {
  id: string;
  name: string;
  engine: string;
  charset: string;
  comment: string;
  columns: MysqlColumnDefinition[];
};

const createId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

export const mysqlEngineOptions = ["InnoDB", "MyISAM", "MEMORY", "CSV"];
export const mysqlCharsetOptions = ["utf8mb4", "utf8", "latin1", "ascii"];

export const mysqlDataTypeOptions: Array<{
  value: string;
  label: string;
  supportsLength?: boolean;
  defaultLength?: string;
  numeric?: boolean;
  autoIncrementOnly?: boolean;
}> = [
  { value: "INT", label: "INT", supportsLength: true, defaultLength: "11", numeric: true, autoIncrementOnly: true },
  { value: "BIGINT", label: "BIGINT", supportsLength: true, defaultLength: "20", numeric: true, autoIncrementOnly: true },
  { value: "SMALLINT", label: "SMALLINT", supportsLength: true, defaultLength: "6", numeric: true, autoIncrementOnly: true },
  { value: "TINYINT", label: "TINYINT", supportsLength: true, defaultLength: "4", numeric: true, autoIncrementOnly: true },
  { value: "DECIMAL", label: "DECIMAL", supportsLength: true, defaultLength: "10,2", numeric: true },
  { value: "FLOAT", label: "FLOAT", supportsLength: false, numeric: true },
  { value: "DOUBLE", label: "DOUBLE", supportsLength: false, numeric: true },
  { value: "BOOLEAN", label: "BOOLEAN", numeric: true },
  { value: "VARCHAR", label: "VARCHAR", supportsLength: true, defaultLength: "255" },
  { value: "CHAR", label: "CHAR", supportsLength: true, defaultLength: "50" },
  { value: "TEXT", label: "TEXT" },
  { value: "LONGTEXT", label: "LONGTEXT" },
  { value: "DATE", label: "DATE" },
  { value: "DATETIME", label: "DATETIME" },
  { value: "TIMESTAMP", label: "TIMESTAMP" },
  { value: "TIME", label: "TIME" },
  { value: "JSON", label: "JSON" },
  { value: "ENUM", label: "ENUM", supportsLength: true, defaultLength: "'draft','published'" },
];

export const primaryKeySupported = (type: string) => {
  const option = mysqlDataTypeOptions.find((item) => item.value === type);
  if (!option) return false;
  if (option.value === "TEXT" || option.value === "LONGTEXT" || option.value === "JSON") return false;
  return true;
};

export const createTableTemplate = (
  name: string,
  columns: Array<Omit<MysqlColumnDefinition, "id"> & Partial<Pick<MysqlColumnDefinition, "id">>> = [
    {
      name: "id",
      type: "INT",
      length: "11",
      unsigned: true,
      nullable: false,
      autoIncrement: true,
      primaryKey: true,
      defaultType: "none",
      defaultValue: "",
    },
    {
      name: "created_at",
      type: "TIMESTAMP",
      unsigned: false,
      nullable: false,
      autoIncrement: false,
      primaryKey: false,
      defaultType: "expression",
      defaultValue: "CURRENT_TIMESTAMP",
    },
  ],
): MysqlTableDefinition => ({
  id: createId(),
  name,
  engine: "InnoDB",
  charset: "utf8mb4",
  comment: "",
  columns: columns.map((column) => createColumnTemplate(column)),
});

export const createColumnTemplate = (
  overrides: Partial<MysqlColumnDefinition> = {},
): MysqlColumnDefinition => ({
  id: createId(),
  name: "",
  type: "VARCHAR",
  length: undefined,
  unsigned: false,
  nullable: true,
  autoIncrement: false,
  primaryKey: false,
  defaultType: "none",
  defaultValue: "",
  ...overrides,
});

const needsLength = (type: string) => mysqlDataTypeOptions.some((option) => option.value === type && option.supportsLength);
const isNumeric = (type: string) => mysqlDataTypeOptions.some((option) => option.value === type && option.numeric);

const escapeIdentifier = (value: string) => `\`${value.replace(/`/g, "``")}\``;
const escapeSingleQuotes = (value: string) => value.replace(/'/g, "''");

const buildColumnSql = (column: MysqlColumnDefinition) => {
  if (!column.name.trim()) return null;
  const pieces: string[] = [escapeIdentifier(column.name.trim()), column.type];

  if (needsLength(column.type) && column.length && column.length.trim().length > 0) {
    pieces.push(`(${column.length.trim()})`);
  }

  if (column.unsigned && isNumeric(column.type)) {
    pieces.push("UNSIGNED");
  }

  pieces.push(column.nullable ? "NULL" : "NOT NULL");

  if (column.autoIncrement) {
    pieces.push("AUTO_INCREMENT");
  }

  if (column.defaultType === "value" && column.defaultValue.trim() !== "") {
    pieces.push(`DEFAULT '${escapeSingleQuotes(column.defaultValue.trim())}'`);
  }

  if (column.defaultType === "expression" && column.defaultValue.trim() !== "") {
    pieces.push(`DEFAULT ${column.defaultValue.trim()}`);
  }

  return `  ${pieces.join(" ")}`;
};

export const createSchemaSql = (databaseName: string, tables: MysqlTableDefinition[]): string => {
  const dbName = databaseName.trim() || "app_db";
  const statements: string[] = [];

  statements.push(
    `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(dbName)} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  statements.push(`USE ${escapeIdentifier(dbName)};`);

  tables.forEach((table) => {
    if (!table.name.trim()) return;
    const columnSql = table.columns
      .map((column) => buildColumnSql(column))
      .filter((line): line is string => Boolean(line));

    const primaryKeyColumns = table.columns
      .filter((column) => column.primaryKey && column.name.trim())
      .map((column) => escapeIdentifier(column.name.trim()));

    if (primaryKeyColumns.length > 0) {
      columnSql.push(`  PRIMARY KEY (${primaryKeyColumns.join(", ")})`);
    }

    if (columnSql.length === 0) return;

    const options: string[] = [`ENGINE=${table.engine || "InnoDB"}`, `DEFAULT CHARSET=${table.charset || "utf8mb4"}`];

    if (table.comment.trim()) {
      options.push(`COMMENT='${escapeSingleQuotes(table.comment.trim())}'`);
    }

    const sql = [`CREATE TABLE IF NOT EXISTS ${escapeIdentifier(table.name.trim())} (`, columnSql.join(",\n"), `) ${options.join(" ")};`].join(
      "\n",
    );

    statements.push(sql);
  });

  return statements.join("\n\n");
};
