import fbDb, { fbAuth } from "@/firebase/admin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const { uid } = req.query;

    if (!uid || typeof uid !== "string") {
      return res.status(400).json({ error: "UID is required" });
    }

    // Fetch user data from Firestore
    const userSnapshot = await fbDb
      .collection("admins")
      .where("userId", "==", uid)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.docs[0].data();

    // Fetch custom claims
    const user = await fbAuth.getUser(uid);
    let customClaims = user.customClaims || {};
    console.log("Custom claims set for user:", uid, customClaims);

    // Check if the role field is "admin" and set custom claims if necessary
    if (userData.role === "Admin") {
      customClaims.admin = true;
    }
    if (userData.role === "User") {
      customClaims.admin = false;
    }

    // Add additionalPermissions to custom claims
    if (userData.additionalPermissions) {
      customClaims.additionalPermissions = userData.additionalPermissions;
    }

    // Add department document ID to custom claims
    if (userData.department) {
      // Fetch department data based on department name
      const departmentSnapshot = await fbDb
        .collection("departments")
        .where("name", "==", userData.department)
        .get();

      if (!departmentSnapshot.empty) {
        const departmentDoc = departmentSnapshot.docs[0];
        const departmentData = departmentDoc.data();
        const departmentDocId = departmentDoc.id;
        customClaims.departmentId = departmentDocId;

        // Store department data in Firestore
        await fbDb
          .collection("departmentsData")
          .doc(departmentDocId)
          .set(departmentData);
      }
    }

    await fbAuth.setCustomUserClaims(uid, customClaims);
    // Refresh user to get updated custom claims
    const updatedUser = await fbAuth.getUser(uid);
    customClaims = updatedUser.customClaims as any;
    console.log("customClaims:", customClaims);

    return res.status(200).json({
      uid: user.uid,
      email: user.email,
      customClaims,
      ...userData,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
