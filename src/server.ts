import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";

let app = express();
app.use(express.json());
app.use(express.static("public"));

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




interface Error {
    error: string;
}

interface Author {
    id: string;
    name: string;
    bio: string;
}

type AuthorResponse = Response<Author | Error>;
app.post("/api/authors", async (req, res: AuthorResponse) => {
    try {
        let author: Author = req.body;
        let authorCheck = db.all(`SELECT * FROM authors WHERE name = ?`, [author.name])
        if (author.name.length < 1 || author.name.length > 25 || (await authorCheck).length > 0) {
            console.log("Author Name is invalid or it already exists. Author name must be between 1 and 25 characters");
            res.status(400).json({ error: "Author name already exists or name is invalid, must be between 1 and 25 characters" });
        }
        else {
            let id = Math.floor(Math.random() * 1000) + 1;
            console.log(author.name);
            let query = `INSERT INTO authors(id, name, bio) VALUES(?, ?, ?)`;
            let params = [id, author.name, author.bio];
            await db.all(query, params);
            console.log("Author added");
            res.json(author);
        }
    } catch (error) {
        res.status(500).json({ error: "Catch 500 Error" });
    }
});

app.get("/api/authors", async (req, res: AuthorResponse) => {
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
            query = query.slice(0, -4) + " ORDER BY name";
        } else {
            query += " ORDER BY name";
        }
        let dummyQuery = `SELECT * FROM AUTHORS ORDER BY "name"`
        let authors: Author = await db.all(query, params);
        res.json(authors);
    } catch (error) {
        res.status(500).json({ error: "Catch 500 Error" });
    }
});

interface Book {
    id: string;
    author_id: string;
    title: string;
    pub_year: string;
    genre: string;
}
type BookResponse = Response<Book | Error>;

app.post("/api/books", async (req, res: BookResponse) => {
    const genres = ["scifi", "adventure", "romance", "thriller", "action", "Scifi", "Adventure", "Romance", "Thriller", "Action"]
    try {
        let book: Book = req.body;
        let id = Math.floor(Math.random() * 1000) + 1;
        let query = `INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(?, ?, ?, ?, ?)`;
        let params = [id, book.author_id, book.title, book.pub_year, book.genre];

        let authorCheck = await db.get(`SELECT * FROM authors WHERE id = ?`, book.author_id);
        if (genres.includes(book.genre) && authorCheck) {
            await db.all(query, params);
            console.log("Book added");
            res.json(book);
        } else if (!authorCheck) {
            res.status(400).json({ error: "Author id doesn't exist. Add the author first" });
        } else {
            res.status(401).json({ error: "Genre doesn't match given genres. Possible genres include: scifi, adventure, romance, thriller, or action" });
        }
    } catch (error) {
        res.status(500).json({ error: "Catch 500 Error" });
    }
});

app.get("/api/books", async (req, res: BookResponse) => {
    try {
        let query = "SELECT * FROM books";
        let params = [];
        if (req.query.search) {
            query = "SELECT * FROM books WHERE title LIKE ?";
            params.push(`%${req.query.search}%`);
        }
        let books: Book = await db.all(query, params);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Catch 500 Error" });
    }
});

app.put("/api/books", async (req, res: BookResponse) => {
    const genres = ["scifi", "adventure", "romance", "thriller", "action", "Scifi", "Adventure", "Romance", "Thriller", "Action"]
    try {
        let book: Book = req.body;

        let bookCheck = await db.get(`SELECT * FROM books WHERE id = ?`, book.id);
        if (genres.includes(book.genre) && bookCheck) {
            const query = `UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ?`;
            const params = [book.author_id, book.title, book.pub_year, book.genre, book.id];
            await db.run(query, params);
            res.json(book);
        } else if (!bookCheck) {
            res.status(400).json({ error: "Book id doesn't exist. Add the book first" });
        } else {
            res.status(401).json({ error: "Genre doesn't match given genres. Possible genres include: scifi, adventure, romance, thriller, or action" });
        }
    } catch (error) {
        res.status(500).json({ error: "Catch 500 error" });
    }
});


interface SuccessMessage {
    message: string
}
type DeleteResponse = Response<SuccessMessage | Error>;

app.delete("/api/books", async (req, res: DeleteResponse) => {
    try {
        let id = req.body.id;
        await db.run(`DELETE FROM books WHERE id = ?`, id);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

app.delete("/api/authors", async (req, res: DeleteResponse) => {
    try {
        let id = req.body.id;
        await db.run(`DELETE FROM authors WHERE id = ?`, id);
        res.json({ message: "Author deleted successfully" });
    } catch (error) {
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
