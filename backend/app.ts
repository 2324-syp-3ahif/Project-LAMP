import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {join} from "path";

const app = express();
const port = process.env.PORT || 2000;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const path = join(__dirname, "../public");
const options = { extensions: ["html", "js"] }; // , "css"
app.use(express.static(path, options));



app.get("/", (req, res) => {
});


app.listen(2000, async () => {
    console.log(`Listening on http://localhost:` + port);

});