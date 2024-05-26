import express from "express";
import {checkMailFormat, checkStringFormat} from "../utils";
import {StatusCodes} from "http-status-codes";
import {IdNotFoundError} from "../interfaces/errors/IdNotFoundError";
import {isPlainText} from "nodemailer/lib/mime-funcs";
import {Tag} from "../interfaces/model/Tag";
import {StringWrongFormatError} from "../interfaces/errors/StringWrongFormatError";
import {deleteTag, updateTag, insertTag, selectTagsByEmail, selectTagsByTasklistID} from "../database-functions/tag-functions";
import {isAuthenticated} from "../middleware/auth-handlers";

export const tagRouter = express.Router();

tagRouter.get("/:param", isAuthenticated,  async (req, res) => {
    if (checkMailFormat(req.params.param)) {
        try {
            const tags: Tag[] = await selectTagsByEmail(req.params.param);
            res.status(StatusCodes.OK).send(tags);
        } catch (err: any) {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("No user found");
            }
        }
    }
    else if (!isNaN(parseInt(req.params.param))){
        try {
            const tags: Tag[] = await selectTagsByTasklistID(parseInt(req.params.param));
            res.status(StatusCodes.OK).send(tags);
        } catch(err: any) {
            if (err instanceof IdNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).send("No user found");
            }
        }
    } else if (isNaN(parseInt(req.params.param))) {
        res.status(StatusCodes.BAD_REQUEST).send("param must be a valid email address");
    }
    else {
        res.status(StatusCodes.BAD_REQUEST).send("param must be a valid tasklistID");
    }
});

tagRouter.post("/:email/:name", isAuthenticated, async (req, res) => {
    const email = req.params.email;
    const name = req.params.name;
    if (!checkMailFormat(req.params.email)) {
        res.status(StatusCodes.BAD_REQUEST).send("email must be a valid email address");
        return;
    }
    if (!isPlainText(name) || name.length > 50 || name.length < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("name must be plain text and between 1 and 50 characters long");
        return;
    }
    try {
        const id = await insertTag(name, email);
        res.status(StatusCodes.CREATED).send({tagID: id, name: name});
    } catch(err: any) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    }
});

tagRouter.put("/:tagID/:name", isAuthenticated, async (req, res) => {
    const tagID = parseInt(req.params.tagID);
    const name = req.params.name;
    if (isNaN(tagID) || tagID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("tagID must be a number");
        return;
    }
    if (!checkStringFormat(name) || name.length > 50 || name.length < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("name must be plain text and between 1 and 50 characters long");
        return;
    }
    try {
        await updateTag(tagID, name);
        res.status(StatusCodes.OK).send({tagID: tagID, name: name});
    } catch(err: any) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
        if (err instanceof StringWrongFormatError) {
            res.status(StatusCodes.BAD_REQUEST).send("name must be plain text and between 1 and 50 characters long");
        }
    }
});

tagRouter.delete("/:tagID", isAuthenticated, async (req, res) => {
    const tagID = parseInt(req.params.tagID);
    if (isNaN(tagID) || tagID < 1) {
        res.status(StatusCodes.BAD_REQUEST).send("tagID must be a number");
        return;
    }
    try {
        await deleteTag(tagID);
        res.status(StatusCodes.OK).send("tag deleted");
    } catch(err: any) {
        if (err instanceof IdNotFoundError) {
            res.status(StatusCodes.BAD_REQUEST).send("No user found");
        }
    }
});




