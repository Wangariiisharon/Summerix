import type { NextApiRequest, NextApiResponse } from "next";
import { fbAuth } from "@/firebase/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.split(" ")[1]; // Assumes a "Bearer token" format

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await fbAuth.verifyIdToken(token);
    res.status(200).json({ message: "Token is valid", uid: decodedToken.uid });
  } catch (error: any) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized", details: error.message });
  }
}
