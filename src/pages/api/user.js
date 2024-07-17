// // api/user.js
// import { admin, db } from "../../lib/firebaseAdmin";

// export default async function handler(req, res) {
//   if (req.method !== "GET") {
//     return res.status(405).end();
//   }

//   try {
//     const { uid } = req.query;

//     if (!uid) {
//       return res.status(400).json({ error: "UID is required" });
//     }

//     // Fetch custom claims
//     const user = await admin.auth().getUser(uid);
//     const customClaims = user.customClaims || {};

//     // Fetch additional user data from Firestore where userId matches uid
//     const userSnapshot = await db
//       .collection("admins")
//       .where("userId", "==", uid)
//       .get();

//     if (userSnapshot.empty) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const userData = userSnapshot.docs[0].data();

//     return res.status(200).json({
//       uid: user.uid,
//       email: user.email,
//       customClaims,
//       ...userData,
//     });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// // api/user.js
import { admin, db } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    // Fetch user data from Firestore
    const userSnapshot = await db
      .collection("admins")
      .where("userId", "==", uid)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.docs[0].data();

    // Fetch custom claims
    const user = await admin.auth().getUser(uid);
    let customClaims = user.customClaims || {};

    // Check if the role field is "admin" and set custom claims if necessary
    if (userData.role === "admin" && !customClaims.admin) {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      // Refresh user to get updated custom claims
      const updatedUser = await admin.auth().getUser(uid);
      customClaims = updatedUser.customClaims;
    }

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
