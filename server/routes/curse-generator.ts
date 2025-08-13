import { Request, Response } from "express";
import { generateCurse, getCurseCategories, getCurseCount, type CurseCategory } from "../lib/curse-generator.js";

// Generate a single curse based on category
export function generateCursesRoute(req: Request, res: Response) {
  try {
    const { category = 'random' } = req.body;

    // Validate category
    if (!['random', 'mild', 'severe', 'funny'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Category must be one of: random, mild, severe, funny",
      });
    }

    const result = generateCurse(category as CurseCategory);

    res.json(result);
  } catch (error) {
    console.error("Error generating curse:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate curse",
    });
  }
}

// Get curse categories with counts
export function getCurseCategoriesRoute(req: Request, res: Response) {
  try {
    const categories = getCurseCategories();
    res.json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.error("Error getting curse categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get curse categories",
    });
  }
}

// Get curse count for specific category
export function getCurseCountRoute(req: Request, res: Response) {
  try {
    const { category = 'random' } = req.query;
    const count = getCurseCount(category as CurseCategory);
    res.json({
      success: true,
      category: category,
      count: count,
    });
  } catch (error) {
    console.error("Error getting curse count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get curse count",
    });
  }
}
