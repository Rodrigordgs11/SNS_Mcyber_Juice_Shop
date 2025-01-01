"use strict";
/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
const challengeUtils = require("../lib/challengeUtils");
const utils = __importStar(require("../lib/utils"));
const datacache_1 = require("../data/datacache");
const security = require('../lib/insecurity');
const safeEval = require('notevil');
const RE2 = require("re2");
module.exports = function b2bOrder() {
    return ({ body }, res, next) => {
        if (utils.isChallengeEnabled(datacache_1.challenges.rceChallenge) || utils.isChallengeEnabled(datacache_1.challenges.rceOccupyChallenge)) {
            const orderLinesData = body.orderLinesData || '';
            if (!isValidOrderLinesData(orderLinesData)) {
                return res.status(400).send('Invalid or potentially harmful orderLinesData.');
            }
            try {
                const processedData = sanitizeOrderLinesData(orderLinesData);
                res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow(), processedData });
            }
            catch (err) {
                if (err.message.match(/Script execution timed out.*/) !== null) {
                    solveIf(rceOccupyChallenge, () => true);
                    res.status(503);
                    next(new Error('Sorry, we are temporarily not available! Please try again later.'));
                }
                else {
                    solveIf(rceChallenge, () => err.message === 'Infinite loop detected - reached max iterations');
                    next(err);
                }
            }
        }
        else {
            res.json({ cid: body.cid, orderNo: uniqueOrderNumber(), paymentDue: dateTwoWeeksFromNow() });
        }
    };
    function uniqueOrderNumber() {
        return security.hash(`${(new Date()).toString()}_B2B`);
    }
    function dateTwoWeeksFromNow() {
        return new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString();
    }
    function isValidOrderLinesData(data) {
        const disallowedPatterns = [
            new RE2('^/\\(\\(a\\+\\)\\+\\)b/'),
            new RE2('[\\s\\S]*(eval|Function|setTimeout|setInterval|exec)[\\s\\S]*')
        ];
        return !disallowedPatterns.some(pattern => pattern.test(data));
    }
    function sanitizeOrderLinesData(data) {
        return data.replace(/[<>]/g, '');
    }
};
//# sourceMappingURL=b2bOrder.js.map