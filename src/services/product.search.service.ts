import User from "../models/user";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import { Op, WhereOptions } from "sequelize";
import { AppError } from "../errors";

export interface ProductSearchQuery {
  productName?: string;
  productCat?: string;
  minPrice?: string;
  maxPrice?: string;
  productRating?: string;
  wholeSale?: string;
  page?: string;
  limit?: string;
}

interface ProductSearchWhereClause {
  productName?: { [Op.like]: string };
  productCat?: { [Op.like]: string };
  price?: { [Op.between]: [number, number] };
  wholeSale?: boolean;
}

export async function searchProducts(query: ProductSearchQuery): Promise<{
  count: number;
  rows: Product[];
}> {
  const {
    productName,
    productCat = "All",
    minPrice,
    maxPrice,
    productRating,
    wholeSale,
    page = "1",
    limit = "10",
  } = query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  if (isNaN(pageNum) || pageNum < 1) {
    throw new AppError("Invalid page number", 400);
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new AppError("Invalid limit value. Must be between 1 and 100", 400);
  }

  const offset = (pageNum - 1) * limitNum;
  const whereClause: ProductSearchWhereClause = {};

  if (productName?.trim()) {
    whereClause.productName = { [Op.like]: `%${productName}%` };
  }

  if (productCat && productCat !== "All") {
    whereClause.productCat = { [Op.like]: `%${productCat}%` };
  }

  const priceMin = minPrice ? parseInt(minPrice) : undefined;
  const priceMax = maxPrice ? parseInt(maxPrice) : undefined;
  if (priceMin !== undefined && priceMax !== undefined) {
    if (isNaN(priceMin) || isNaN(priceMax)) {
      throw new AppError("Invalid price range values", 400);
    }
    if (priceMin > priceMax) {
      throw new AppError(
        "Minimum price cannot be greater than maximum price",
        400,
      );
    }
    whereClause.price = { [Op.between]: [priceMin, priceMax] };
  }

  if (wholeSale === "true") {
    whereClause.wholeSale = true;
  }

  const rating = productRating ? parseInt(productRating) : 5;
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new AppError("Invalid rating value. Must be between 1 and 5", 400);
  }

  const result = await Product.findAndCountAll({
    where: whereClause as WhereOptions,
    limit: limitNum,
    offset,
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
      },
      {
        model: BuyerReview,
        attributes: ["id", "comment", "rating"],
        where: { rating },
        include: [
          {
            model: User,
            attributes: [
              "id",
              "firstName",
              "lastName",
              "country",
              "verifiedUser",
            ],
          },
        ],
        required: false,
      },
    ],
  });

  return result;
}
