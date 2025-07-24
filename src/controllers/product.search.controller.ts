import User from "../models/user";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import { Op, WhereOptions } from "sequelize";
import { Request, Response } from "express";
import AppError from "../errors/customErrors";

interface ProductSearchWhereClause {
  productName?: { [Op.like]: string };
  productCat?: { [Op.like]: string };
  price?: { [Op.between]: [number, number] };
  wholeSale?: boolean;
}

interface ProductSearchQuery {
  productName?: string;
  productCat?: string;
  minPrice?: string;
  maxPrice?: string;
  productRating?: string;
  wholeSale?: string;
  page?: string;
  limit?: string;
}

// Get all products with search and filters
export const getAllProductSearch = async (
  req: Request<unknown, unknown, unknown, ProductSearchQuery>,
  res: Response,
): Promise<void> => {
  try {
    const {
      productName,
      productCat = "All",
      minPrice,
      maxPrice,
      productRating,
      wholeSale,
      page = "1",
      limit = "10",
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new AppError("Invalid page number", 400);
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError("Invalid limit value. Must be between 1 and 100", 400);
    }

    const offset: number = (pageNum - 1) * limitNum;
    const whereClause: ProductSearchWhereClause = {};

    // Build where clause based on query parameters
    if (productName?.trim()) {
      whereClause.productName = {
        [Op.like]: `%${productName}%`,
      };
    }

    if (productCat && productCat !== "All") {
      whereClause.productCat = {
        [Op.like]: `%${productCat}%`,
      };
    }

    // Validate and add price range
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
      whereClause.price = {
        [Op.between]: [priceMin, priceMax],
      };
    }

    if (wholeSale === "true") {
      whereClause.wholeSale = true;
    }

    // Validate rating
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
          attributes: [
            "id",
            "firstName",
            "lastName",
            "country",
            "verifiedUser",
          ],
        },
        {
          model: BuyerReview,
          attributes: ["id", "comment", "rating"],
          where: {
            rating,
          },
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

    if (!result.count) {
      res.status(200).json({
        message: "No products found matching the search criteria",
        queryResult: result,
      });
      return;
    }

    res.status(200).json({
      queryResult: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error searching products",
    });
  }
};
