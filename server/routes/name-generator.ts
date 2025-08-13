import { Request, Response } from "express";
import { generateNames, isValidAlignment, getAlignmentOptions, type NameAlignment } from "../lib/name-generator.js";

// Generate names based on alignment and count
export function generateNamesRoute(req: Request, res: Response) {
  try {
    const { alignment, numNames = 8 } = req.body;

    // Handle Random selection (alignment 0)
    let actualAlignment: NameAlignment;
    if (alignment === 0) {
      // Random selection - pick random alignment from 1-17
      actualAlignment = (Math.floor(Math.random() * 17) + 1) as NameAlignment;
    } else if (!isValidAlignment(alignment)) {
      return res.status(400).json({
        success: false,
        error: "Invalid alignment. Must be 0 (Random) or 1-17 for specific styles",
      });
    } else {
      actualAlignment = alignment as NameAlignment;
    }

    if (typeof numNames !== 'number' || numNames < 1 || numNames > 50) {
      return res.status(400).json({
        success: false,
        error: "Number of names must be between 1 and 50",
      });
    }

    const result = generateNames(actualAlignment, numNames);

    // Include the actual alignment that was used (important for Random selection)
    res.json({
      ...result,
      actualAlignment: actualAlignment
    });
  } catch (error) {
    console.error("Error generating names:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate names",
    });
  }
}

// Get available alignment options
export function getAlignmentOptionsRoute(req: Request, res: Response) {
  try {
    const options = getAlignmentOptions();
    res.json({
      success: true,
      alignments: options,
    });
  } catch (error) {
    console.error("Error getting alignment options:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get alignment options",
    });
  }
}
