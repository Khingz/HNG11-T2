const express = require("express");
const { verify_jwt } = require("../middleware/auth/auth");
const { getUser } = require("../controllers/user.controller");

const router = express.Router();

router.get('/:id', verify_jwt, getUser);

module.exports = router;