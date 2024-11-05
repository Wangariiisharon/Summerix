import fbDb from "@/firebase/admin";
import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const snapshot = await fbDb.collection("settings").doc("currencies").get();
    if (snapshot.exists) {
      const rates = snapshot.data();
      res.status(200).json({ rates });
    } else {
      res.status(404).json({ error: "No currency rates found" });
    }
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    res.status(500).json({ error: "Failed to fetch currency rates" });
  }
};
