"use strict";
import { recursiveMkdir } from "./modules"; // utils

import level from "level";

const dbLocation = "db/" + (process.env.DB || process.env.P2P_PORT || 6001);
recursiveMkdir(dbLocation);
console.log("make direct");

const db = level(dbLocation);

export default {
    db
};
