export type DataFieldType =
  | "fullName"
  | "firstName"
  | "lastName"
  | "email"
  | "company"
  | "jobTitle"
  | "city"
  | "country"
  | "uuid"
  | "boolean"
  | "integer"
  | "price"
  | "date"
  | "color"
  | "url"
  | "lorem"
  | "tag";

export type DataFieldDefinition = {
  id: string;
  label: string;
  type: DataFieldType;
  description: string;
};

export type DatasetRecord = Record<string, string | number | boolean>;

export type DatasetGenerationOptions = {
  seed?: string;
  locale?: "en";
  integerRange?: { min: number; max: number };
};

export type GeneratedDataset = {
  records: DatasetRecord[];
};

const firstNames = [
  "Ada",
  "Grace",
  "Chris",
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Elliot",
  "Sam",
  "Avery",
  "Jamie",
  "Riley",
  "Harper",
  "Casey",
  "Rowan",
  "Mika",
  "Parker",
  "Quinn",
  "Sasha",
  "Reese",
];

const lastNames = [
  "Stone",
  "Anders",
  "Bennett",
  "Cole",
  "Finch",
  "Hayes",
  "Jensen",
  "Keller",
  "Lambert",
  "Monroe",
  "Nolan",
  "Osborne",
  "Prescott",
  "Ramsey",
  "Sawyer",
  "Thorne",
  "Vega",
  "Wilder",
  "Young",
  "Zimmer",
];

const companies = [
  "Pixel Forge",
  "Atlas Labs",
  "Nimbus Collective",
  "Lumen Studio",
  "Northwind",
  "Copperline",
  "Beacon Works",
  "Orbit Systems",
  "Brightwave",
  "Mono Labs",
  "Vector Foundry",
  "Aurora",
  "Bluebell",
  "NovaNest",
  "Sunrise",
];

const jobTitles = [
  "Product Designer",
  "Software Engineer",
  "Frontend Developer",
  "UX Researcher",
  "QA Analyst",
  "Technical Writer",
  "Product Manager",
  "Data Scientist",
  "Brand Strategist",
  "Marketing Lead",
  "Support Specialist",
  "Ops Coordinator",
];

const cities = [
  "Amsterdam",
  "Berlin",
  "Chicago",
  "Lisbon",
  "New York",
  "Oslo",
  "Sydney",
  "Toronto",
  "San Francisco",
  "Vancouver",
  "London",
  "Austin",
  "Reykjavik",
];

const countries = [
  "Netherlands",
  "Germany",
  "United States",
  "Portugal",
  "Norway",
  "Australia",
  "Canada",
  "United Kingdom",
  "Iceland",
  "Spain",
  "France",
];

const loremSnippets = [
  "Design delightful tooling experiences.",
  "Ship faster with reusable assets.",
  "Automate repetitive design ops.",
  "Generate production-ready exports.",
  "Keep brand systems in sync.",
  "Preview content across platforms.",
];

const tags = [
  "design",
  "frontend",
  "product",
  "marketing",
  "ops",
  "engineering",
  "qa",
  "accessibility",
  "content",
  "automation",
];

export const dataFieldPresets: DataFieldDefinition[] = [
  { id: "id", label: "ID", type: "uuid", description: "Unique identifier" },
  { id: "fullName", label: "Full name", type: "fullName", description: "Random first + last name" },
  { id: "firstName", label: "First name", type: "firstName", description: "Given name from inclusive list" },
  { id: "lastName", label: "Last name", type: "lastName", description: "Family name" },
  { id: "email", label: "Email", type: "email", description: "Email derived from name" },
  { id: "company", label: "Company", type: "company", description: "Fictional company" },
  { id: "jobTitle", label: "Job title", type: "jobTitle", description: "Role or discipline" },
  { id: "city", label: "City", type: "city", description: "City name" },
  { id: "country", label: "Country", type: "country", description: "Country name" },
  { id: "active", label: "Active", type: "boolean", description: "Boolean true/false" },
  { id: "score", label: "Score", type: "integer", description: "Integer between 1-100" },
  { id: "price", label: "Price", type: "price", description: "Currency-like decimal" },
  { id: "joined", label: "Joined", type: "date", description: "Recent ISO date" },
  { id: "favoriteColor", label: "Favourite colour", type: "color", description: "Hex colour code" },
  { id: "website", label: "Website", type: "url", description: "Simple https URL" },
  { id: "bio", label: "Bio", type: "lorem", description: "Short marketing blurb" },
  { id: "tag", label: "Tag", type: "tag", description: "Single descriptor" },
];

export function generateDataset(
  fields: DataFieldDefinition[],
  count: number,
  options: DatasetGenerationOptions = {},
): GeneratedDataset {
  const records: DatasetRecord[] = [];
  const random = createRandom(options.seed);

  for (let index = 0; index < count; index += 1) {
    const context = createRecordContext(random);
    const record: DatasetRecord = {};
    fields.forEach((field) => {
      record[field.id] = generateValue(field, index, random, options, context);
    });
    records.push(record);
  }

  return { records };
}

export function datasetToJson(dataset: GeneratedDataset, spacing = 2): string {
  return JSON.stringify(dataset.records, null, spacing);
}

export function datasetToCsv(fields: DataFieldDefinition[], dataset: GeneratedDataset): string {
  if (fields.length === 0) return "";

  const header = fields.map((field) => escapeCsv(field.label)).join(",");
  const rows = dataset.records.map((record) =>
    fields
      .map((field) => {
        const value = record[field.id];
        return escapeCsv(value === undefined ? "" : String(value));
      })
      .join(","),
  );

  return [header, ...rows].join("\n");
}

type RecordContext = {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  city: string;
  country: string;
  color: string;
  lorem: string;
  tag: string;
  url: string;
};

function generateValue(
  field: DataFieldDefinition,
  index: number,
  random: () => number,
  options: DatasetGenerationOptions,
  context: RecordContext,
) {
  switch (field.type) {
    case "uuid":
      return createUuid();
    case "fullName":
      return `${context.firstName} ${context.lastName}`;
    case "firstName":
      return context.firstName;
    case "lastName":
      return context.lastName;
    case "email":
      return buildEmail(context.firstName, context.lastName, context.company);
    case "company":
      return context.company;
    case "jobTitle":
      return context.jobTitle;
    case "city":
      return context.city;
    case "country":
      return context.country;
    case "boolean":
      return random() > 0.5;
    case "integer":
      return integerFromRange(options.integerRange ?? { min: 1, max: 100 }, random);
    case "price":
      return randomPrice(random);
    case "date":
      return recentDate(random);
    case "color":
      return context.color;
    case "url":
      return context.url;
    case "lorem":
      return context.lorem;
    case "tag":
      return context.tag;
    default:
      return `${slugify(field.label) || field.id || "field"}-${index + 1}`;
  }
}

function createRecordContext(random: () => number): RecordContext {
  const firstName = randomFirstName(random);
  const lastName = randomLastName(random);
  const company = randomChoice(companies, random);
  const jobTitle = randomChoice(jobTitles, random);
  const city = randomChoice(cities, random);
  const country = randomChoice(countries, random);
  const color = randomColor(random);
  const lorem = randomChoice(loremSnippets, random);
  const tag = randomChoice(tags, random);
  const url = `https://example.com/${slugify(jobTitle)}`;

  return {
    firstName,
    lastName,
    company,
    jobTitle,
    city,
    country,
    color,
    lorem,
    tag,
    url,
  };
}

function createRandom(seed?: string) {
  if (!seed) {
    return () => Math.random();
  }

  const numericSeed = stringToSeed(seed);
  return mulberry32(numericSeed);
}

function randomChoice<T>(list: T[], random: () => number): T {
  if (list.length === 0) {
    throw new Error("Cannot choose from empty list");
  }
  const index = Math.floor(random() * list.length);
  return list[index];
}

function randomFirstName(random: () => number): string {
  return randomChoice(firstNames, random);
}

function randomLastName(random: () => number): string {
  return randomChoice(lastNames, random);
}

function buildEmail(first: string, last: string, company: string): string {
  const handle = `${slugify(first)}.${slugify(last)}`;
  const domain = slugify(company).replace(/-/g, "");
  return `${handle}@${domain || "example"}.com`;
}

function integerFromRange(range: { min: number; max: number }, random: () => number): number {
  const min = Math.ceil(range.min);
  const max = Math.floor(range.max);
  return Math.floor(random() * (max - min + 1)) + min;
}

function recentDate(random: () => number): string {
  const now = Date.now();
  const thirtySixFiveDays = 1000 * 60 * 60 * 24 * 365;
  const offset = Math.floor(random() * thirtySixFiveDays);
  const date = new Date(now - offset);
  return date.toISOString().split("T")[0];
}

function randomColor(random: () => number): string {
  const value = Math.floor(random() * 0xffffff);
  return `#${value.toString(16).padStart(6, "0")}`.toUpperCase();
}

function randomPrice(random: () => number): string {
  const base = 10 + random() * 990;
  return (Math.round(base * 100) / 100).toFixed(2);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stringToSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0; // Convert to 32bit integer
  }
  return hash || 1;
}

function mulberry32(seed: number) {
  let t = seed;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  let uuid = "";
  for (let i = 0; i < 36; i += 1) {
    if (i === 14) {
      uuid += "4";
    } else if (i === 19) {
      uuid += ((Math.random() * 4) | 8).toString(16);
    } else if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += "-";
    } else {
      uuid += Math.floor(Math.random() * 16).toString(16);
    }
  }
  return uuid;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

