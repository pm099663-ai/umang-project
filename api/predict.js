const { calculate } = require("../lib/estimate");
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  const result = calculate(req.body && typeof req.body === "object" ? req.body : {});
  if (!result.ok) return res.status(400).json({ error: "Please check the highlighted estimate values.", fields: result.fields });
  return res.status(200).json(result);
};
