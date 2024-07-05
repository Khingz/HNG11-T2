const express = require("express");
const { verify_jwt } = require("../middleware/auth/auth");
const { getUserOrganisations, getSingleOrganisation } = require("../controllers/organisation.controller");

const router = express.Router();

router.get('/', verify_jwt, getUserOrganisations);
router.get('/:orgId', verify_jwt, getSingleOrganisation);

module.exports = router;