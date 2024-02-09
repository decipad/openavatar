const Service = require("../models/Service");

const serviceAuth = async (req, res, next) => {
  try {
    const apiKey = req.header("Authorization").replace("Bearer ", "");
    const service = await Service.findOne({ apiKey });

    if (!service) {
      throw new Error("Service not authorized");
    }

    req.service = service;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate as a service" });
  }
};

module.exports = serviceAuth;
