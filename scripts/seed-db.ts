/**
 * Seed the database with minimal data for the farming-products app.
 * Run after migrations: yarn db:seed or npm run db:seed
 */
import dotenv from "dotenv";
dotenv.config();

import { join } from "path";
import fs from "fs";
import { Sequelize } from "sequelize-typescript";
import { hashSync } from "bcryptjs";

const environment = process.env.NODE_ENV || "development";
const connectionString = process.env.DATABASE_URL?.trim();
const useConnectionString =
  connectionString && connectionString !== "undefined";

if (
  !useConnectionString &&
  !(process.env.DB_NAME && process.env.DB_USERNAME && process.env.DB_PASSWORD)
) {
  console.error(
    "Database not configured: set DATABASE_URL or DB_NAME, DB_USERNAME, DB_PASSWORD in .env"
  );
  process.exit(1);
}

const modelsDir = join(__dirname, "../src/models");
const modelPaths = fs
  .readdirSync(modelsDir)
  .filter(
    (f) =>
      (f.endsWith(".ts") || f.endsWith(".js")) && !f.startsWith("index")
  )
  .map((f) => join(modelsDir, f));

const sequelizeOptions = {
  dialect: "postgres" as const,
  models: modelPaths,
  logging: false,
  ...(environment === "production" && {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }),
};

const sequelize = useConnectionString
  ? new Sequelize(connectionString!, sequelizeOptions)
  : new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USERNAME!,
    process.env.DB_PASSWORD!,
    { ...sequelizeOptions, host: process.env.DB_HOST }
  );

const Role = sequelize.models.Role;
const User = sequelize.models.User;
const Product = sequelize.models.Product;

const SEED_PASSWORD = "SeedPass1!";

async function seed() {
  await sequelize.authenticate();

  const [farmerRole] = await Role.findOrCreate({
    where: { roleName: "farmer" },
    defaults: { roleName: "farmer" },
  });
  const [buyerRole] = await Role.findOrCreate({
    where: { roleName: "buyer" },
    defaults: { roleName: "buyer" },
  });

  const farmerRoleId = (farmerRole as unknown as { id: string }).id;
  const buyerRoleId = (buyerRole as unknown as { id: string }).id;

  const [farmer] = await User.findOrCreate({
    where: { email: "farmer@farm.local" },
    defaults: {
      firstName: "Farm",
      lastName: "Owner",
      email: "farmer@farm.local",
      address: "123 Farm Road",
      country: "Cameroon",
      phoneNum: "237700000001",
      password: hashSync(SEED_PASSWORD, 10),
      roleId: farmerRoleId,
      vip: false,
      verifiedUser: true,
      imageUrl: "",
      googleId: "",
      facebookId: "",
      expoPushToken: null,
      shipAddress: [],
    },
  });

  const [buyer] = await User.findOrCreate({
    where: { email: "buyer@farm.local" },
    defaults: {
      firstName: "Buyer",
      lastName: "User",
      email: "buyer@farm.local",
      address: "456 Market Street",
      country: "Cameroon",
      phoneNum: "237700000002",
      password: hashSync(SEED_PASSWORD, 10),
      roleId: buyerRoleId,
      vip: false,
      verifiedUser: true,
      imageUrl: "",
      googleId: "",
      facebookId: "",
      expoPushToken: null,
      shipAddress: [],
    },
  });

  const farmerIdRef = (farmer as unknown as { id: string }).id;
  const productData = [
    { productName: "Organic Tomatoes", productCat: "Vegetables", priceType: "per kg", price: 800, description: "Fresh organic tomatoes from local farm.", wholeSale: true, userId: farmerIdRef },
    { productName: "Green Bell Peppers", productCat: "Vegetables", priceType: "per kg", price: 1200, description: "Fresh green peppers for cooking.", wholeSale: true, userId: farmerIdRef },
    { productName: "Onions", productCat: "Vegetables", priceType: "per kg", price: 600, description: "Local red onions.", wholeSale: true, userId: farmerIdRef },
    { productName: "Carrots", productCat: "Vegetables", priceType: "per kg", price: 900, description: "Fresh carrots, ideal for salads and cooking.", wholeSale: false, userId: farmerIdRef },
    { productName: "Cabbage", productCat: "Vegetables", priceType: "per head", price: 500, description: "Fresh green cabbage.", wholeSale: true, userId: farmerIdRef },
    { productName: "Eggplant", productCat: "Vegetables", priceType: "per kg", price: 700, description: "Purple eggplant, locally grown.", wholeSale: false, userId: farmerIdRef },
    { productName: "Plantain", productCat: "Fruits", priceType: "per bunch", price: 1500, description: "Ripe plantain, ideal for cooking.", wholeSale: false, userId: farmerIdRef },
    { productName: "Pineapple", productCat: "Fruits", priceType: "per unit", price: 800, description: "Sweet ripe pineapple.", wholeSale: true, userId: farmerIdRef },
    { productName: "Mango", productCat: "Fruits", priceType: "per crate", price: 12000, description: "Seasonal mango, 20 kg crate.", wholeSale: true, userId: farmerIdRef },
    { productName: "Papaya", productCat: "Fruits", priceType: "per kg", price: 400, description: "Ripe papaya.", wholeSale: false, userId: farmerIdRef },
    { productName: "Orange", productCat: "Fruits", priceType: "per kg", price: 650, description: "Fresh citrus oranges.", wholeSale: true, userId: farmerIdRef },
    { productName: "Watermelon", productCat: "Fruits", priceType: "per unit", price: 2500, description: "Large sweet watermelon.", wholeSale: false, userId: farmerIdRef },
    { productName: "Maize", productCat: "Grains", priceType: "per sack", price: 25000, description: "Dried maize, 50 kg sack.", wholeSale: true, userId: farmerIdRef },
    { productName: "Rice (local)", productCat: "Grains", priceType: "per kg", price: 550, description: "Local white rice.", wholeSale: true, userId: farmerIdRef },
    { productName: "Beans", productCat: "Legumes", priceType: "per kg", price: 1200, description: "Red beans, dried.", wholeSale: true, userId: farmerIdRef },
    { productName: "Groundnut", productCat: "Legumes", priceType: "per kg", price: 1800, description: "Shelled groundnuts.", wholeSale: true, userId: farmerIdRef },
    { productName: "Cassava", productCat: "Tubers", priceType: "per kg", price: 350, description: "Fresh cassava tubers.", wholeSale: true, userId: farmerIdRef },
    { productName: "Sweet Potato", productCat: "Tubers", priceType: "per kg", price: 450, description: "Orange flesh sweet potato.", wholeSale: false, userId: farmerIdRef },
    { productName: "Yam", productCat: "Tubers", priceType: "per kg", price: 750, description: "White yam, good for pounding.", wholeSale: true, userId: farmerIdRef },
    { productName: "Cocoyam", productCat: "Tubers", priceType: "per kg", price: 500, description: "Fresh cocoyam.", wholeSale: false, userId: farmerIdRef },
    { productName: "Pepper (dried)", productCat: "Spices", priceType: "per kg", price: 3500, description: "Dried red pepper, ground or whole.", wholeSale: true, userId: farmerIdRef },
    { productName: "Ginger", productCat: "Spices", priceType: "per kg", price: 2200, description: "Fresh ginger rhizomes.", wholeSale: true, userId: farmerIdRef },
    { productName: "Garlic", productCat: "Spices", priceType: "per kg", price: 2800, description: "Fresh garlic bulbs.", wholeSale: false, userId: farmerIdRef },
  ];

  for (const data of productData) {
    await Product.findOrCreate({
      where: { productName: data.productName, userId: farmerIdRef },
      defaults: data,
    });
  }

  console.log("✅ Seed done. Farmer: farmer@farm.local, Buyer: buyer@farm.local, password:", SEED_PASSWORD);
}

async function main() {
  try {
    await seed();
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    await sequelize.close().catch(() => { });
    process.exit(1);
  }
}

main();
