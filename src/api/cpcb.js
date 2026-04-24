export default async function handler(req, res) {
  const { search } = req.query;

  const baseURL = process.env.CPCB_API_URL;

  if (!baseURL) {
    return res.status(500).json({
      error: "CPCB API URL not configured"
    });
  }

  if (!search) {
    return res.status(400).json({
      error: "search parameter is required"
    });
  }

  try {
    const response = await fetch(
      `${baseURL}/device?search=${search}&list=true`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `CPCB API responded with status ${response.status}`
      });
    }

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error("Proxy Error:", error);

    return res.status(500).json({
      error: "Failed to fetch CPCB API"
    });
  }
}