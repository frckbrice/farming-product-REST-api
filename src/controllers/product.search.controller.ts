import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import * as productSearchService from "../services/product.search.service";

export const getAllProductSearch = async (
  req: Request<unknown, unknown, unknown, productSearchService.ProductSearchQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as productSearchService.ProductSearchQuery;
    const result = await productSearchService.searchProducts(query);

    if (!result.count) {
      res.status(200).json({
        message: "No products found matching the search criteria",
        queryResult: result,
      });
      return;
    }

    res.status(200).json({ queryResult: result });
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
