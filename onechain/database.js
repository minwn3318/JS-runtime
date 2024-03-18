"use strict";
import { recursiveMkdir } from "./modules"; // utils

import level from "level";

const dbLocation = "db/" + (process.env.DB || process.env.P2P_PORT || 6001);
recursiveMkdir(dbLocation); //저장장소에 저정하기

const db = level(dbLocation);//(level)

export default {
    db
};
