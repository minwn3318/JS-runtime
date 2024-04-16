"use strict";
import { recursiveMkdir } from "./modules"; // utils
import { logger } from "./logger";

import level from "level";

const fileName = "database.js";

const dbLocation = "db/" + (process.env.DB || process.env.P2P_PORT || 6001);

const functionName = "database-recurisveMkdir";
logger.log({level: 'info', message : 'get database', fileN : fileName, functionN:functionName});
recursiveMkdir(dbLocation);
logger.log({level: 'info', message : 'get database', fileN : fileName, functionN:functionName});

const db = level(dbLocation);

export default {
    db
};
