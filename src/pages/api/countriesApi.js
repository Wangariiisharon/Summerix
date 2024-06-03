import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    console.log("Starting to fetch countries");
    const response = await fetch("https://restcountries.com/v3.1/all");
    console.log("Response status:", response.status); // Log response status

    if (!response.ok) {
      throw new Error(
        `Failed to fetch countries: ${response.status} ${response.statusText}`
      );
    }

    const countries = await response.json();
    console.log("Fetched countries successfully"); // Log successful fetch
    res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "fetch failed", error: error.message });
  }
}
