const express = require("express");
const { verify_jwt } = require("../middleware/auth/auth");
const { getUserOrganisations } = require("../controllers/organisation.controller");

const router = express.Router();

router.get('/', verify_jwt, getUserOrganisations);

module.exports = router;