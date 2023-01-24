import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
let app = express();
app.use(express.json());
// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
app.post("/addtoauthors", async (req, res) => {
    try {
        let author = req.body;
        let query = `INSERT INTO authors(id, name, bio) VALUES(?, ?, ?)`;
        let params = [author.id, author.name, author.bio];
        await db.all(query, params);
        console.log("Author added");
        res.json(author);
    }
    catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.get("/getauthors", async (req, res) => {
    try {
        let query = "SELECT * FROM authors";
        let params = [];
        if (Object.keys(req.query).length !== 0) {
            query = "SELECT * FROM authors WHERE ";
            for (let key in req.query) {
                if (key === "id" || key === "name" || key === "bio") {
                    query += `${key} = ? AND `;
                    params.push(req.query[key]);
                }
            }
            query = query.slice(0, -4);
        }
        let authors = await db.all(query, params);
        res.json(authors);
    }
    catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.post("/addtobooks", async (req, res) => {
    const genres = ["scifi", "adventure", "romance", "thriller"];
    try {
        let book = req.body;
        let query = `INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(?, ?, ?, ?, ?)`;
        let params = [book.id, book.author_id, book.title, book.pub_year, book.genre];
        // check if the author_id of the book already exists in the authors table
        let authorCheck = await db.get(`SELECT * FROM authors WHERE id = ?`, book.author_id);
        if (genres.includes(book.genre) && authorCheck) {
            await db.all(query, params);
            console.log("Book added");
            res.json(book);
        }
        else if (!authorCheck) {
            res.status(400).json({ error: "Author id doesn't exist. Add the author first" });
        }
        else {
            res.status(400).json({ error: "Genre doesn't match given genres. Possible genres include: scifi, adventure, romance, or thriller" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.get("/getbooks", async (req, res) => {
    try {
        let query = "SELECT * FROM books";
        let params = [];
        if (Object.keys(req.query).length !== 0) {
            query = "SELECT * FROM books WHERE ";
            for (let key in req.query) {
                if (key === "id" || key === "author_id" || key === "title" || key === "pub_year" || key === "genre") {
                    query += `${key} = ? AND `;
                    params.push(req.query[key]);
                }
            }
            query = query.slice(0, -4);
        }
        let books = await db.all(query, params);
        res.json(books);
    }
    catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.delete("/deletebook", async (req, res) => {
    try {
        let id = req.body.id;
        await db.run(`DELETE FROM books WHERE id = ?`, id);
        res.json({ message: "Book deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.delete("/deleteauthor", async (req, res) => {
    try {
        let id = req.body.id;
        await db.run(`DELETE FROM authors WHERE id = ?`, id);
        res.json({ message: "Author deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error" });
    }
});
app.all("*", (req, res) => {
    res.status(404).json({ error: "Request handler doesn't exist" });
});
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
