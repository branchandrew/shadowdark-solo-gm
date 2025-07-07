import { RequestHandler } from "express";

export const testFateChart: RequestHandler = async (req, res) => {
  try {
    console.log("Test Fate Chart endpoint called");

    // Simple test response to verify the endpoint works
    const testResult = {
      success: true,
      roll: 42,
      threshold: 10,
      result_success: false,
      exceptional: false,
      result: "No",
      likelihood: "50/50",
      chaos_factor: 5,
      likelihood_index: 4,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending test result:", testResult);
    res.json(testResult);
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
