import express from "express";
import {checkMailFormat, checkStringFormat} from "../utils";
import {StatusCodes} from "http-status-codes";
import {getMaxId, selectTagsByEmail, selectTagsByTasklistID} from "../database-functions/select-data";
import {db} from "../app";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {isPlainText} from "nodemailer/lib/mime-funcs";
import {insertTag} from "../database-functions/insert-data";
import {Tag} from "../interfaces/model/Tag";
import {updateTag} from "../database-functions/update-data";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {deleteTagByID} from "../database-functions/delete-data";

export const tagRouter = express.Router();

tagRouter.get("/:param", (req, res) => {
    if (checkMailFormat(req.params.param)) {
        selectTagsByEmail(db, req.params.param).then(tags => {
            res.status(StatusCodes.OK).send(tags);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("NO user found");
            }
        })
    } else if (!isNaN(parseInt(req.params.param))){
        selectTagsByTasklistID(db, parseInt(req.params.param)).then(tags => {
            res.status(StatusCodes.OK).send(tags);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("NO user found");
            }
        });
    } else if (isNaN(parseInt(req.params.param))) {
        res.status(StatusCodes.BAD_REQUEST).send("param must be a valid email address");
    }
    else {
        res.status(StatusCodes.BAD_REQUEST).send("param must be a valid tasklistID");
    }
});

tagRouter.post("/:email/:name", async (req, res) => {
    const email = req.params.email;
    if (!checkMailFormat(req.params.email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    const name = req.params.name;
    if (!isPlainText(name) || name.length > 50 || name.length < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("name must be plain text and between 1 and 50 characters long");
        return;
    }
    const tag: Tag = {
        tagID: await getMaxId(db, 'TAGS', 'tagID') + 1,
        name: name
    }
    insertTag(db, name, email).then(() => {
            res.status(StatusCodes.CREATED).send(tag);
        }).catch((err) => {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("NO user found");
            }
        });
});

tagRouter.put("/:tagID/:name" , async (req, res) => {
    const tagID = parseInt(req.params.tagID);
    if (isNaN(tagID) || tagID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("tagID must be a number");
        return;
    }
    const name = req.params.name;
    if (!checkStringFormat(name) || name.length > 50 || name.length < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("name must be plain text and between 1 and 50 characters long");
        return;
    }
    updateTag(db, tagID, name).then(() => {
        const tag: Tag = {
            tagID: tagID,
            name: name
        }
        res.status(StatusCodes.OK).send(tag);
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
        if (err instanceof StringWrongFormatError) {
            res.status(StatusCodes.BAD_REQUEST).send("name must be plain text and between 1 and 50 characters long");
        }
    });
});

tagRouter.delete("/:tagID", async (req, res) => {
    const tagID = parseInt(req.params.tagID);
    if (isNaN(tagID) || tagID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("tagID must be a number");
        return;
    }
    deleteTagByID(db, tagID).then(() => {
        res.status(StatusCodes.OK).send("tag deleted");
    }).catch((err) => {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("NO user found");
        }
    });
});

