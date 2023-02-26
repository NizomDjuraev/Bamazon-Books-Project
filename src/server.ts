import express, {
    Request,
    Response,
    RequestHandler,
    CookieOptions,
} from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import * as argon2 from "argon2";
import crypto from "crypto";
import { z } from "zod";
import cookieParser from "cookie-parser";
import * as path from "path";
import helmet from "helmet";

let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
let publicStaticFolder = path.resolve(__dirname, "out", "public");


let app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "out", "public")));
app.use(helmet());

await db.get("PRAGMA foreign_keys = ON");


let loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

let tokenStorage: { [key: string]: { username: string } } = {};

let cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
};

let authorize: RequestHandler = (req, res, next) => {
    if (req.cookies["token"] && tokenStorage[req.cookies["token"]]) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized access, not logged in" });
    }
};

function makeToken() {
    return crypto.randomBytes(32).toString("hex");
}


interface LoginMessage {
    message: string
}
interface Error {
    error: string;
}
interface Author {
    id: string;
    name: string;
    bio: string;
}
interface Book {
    id: string;
    author_id: string;
    title: string;
    pub_year: string;
    genre: string;
}
interface MessageResponse {
    message: string;
}
interface SuccessMessage {
    message: string
}

type AuthorResponse = Response<Author | Error>;
type BookResponse = Response<Book | Error>;
type LoginResponse = Response<SuccessMessage | Error>;
type DeleteResponse = Response<SuccessMessage | Error>;
type EmptyResponse = "";


app.post("/api/authors", authorize, async (req: Request, res: AuthorResponse) => {
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

app.get("/api/authors", authorize, async (req: Request, res: AuthorResponse) => {
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

app.post("/api/books", authorize, async (req: Request, res: BookResponse) => {
    let genres = ["scifi", "adventure", "romance", "thriller", "action", "Scifi", "Adventure", "Romance", "Thriller", "Action"]
    try {
        let book: Book = req.body;
        let id = Math.floor(Math.random() * 1000) + 1;
        let query = `INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(?, ?, ?, ?, ?)`;
        let params = [id, book.author_id, book.title, book.pub_year, book.genre];

        let authorCheck = await db.get(`SELECT * FROM authors WHERE id = ?`, book.author_id);
        if (genres.includes(book.genre) && authorCheck) {
            await db.all(query, params);
            let username = tokenStorage[req.cookies["token"]].username;
            await db.all(`INSERT INTO created_by(username, book_id) VALUES(?, ?)`, [username, id])
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

app.get("/api/books", authorize, async (req: Request, res: BookResponse) => {
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

app.put("/api/books", authorize, async (req: Request, res: BookResponse) => {
    let genres = ["scifi", "adventure", "romance", "thriller", "action", "Scifi", "Adventure", "Romance", "Thriller", "Action"]
    try {
        let book: Book = req.body;

        let bookCheck = await db.get(`SELECT * FROM books WHERE id = ?`, book.id);
        if (book.author_id === '' || book.title === '' || book.pub_year === '') {
            return res.status(402).json({ error: "Blank inputs are invalid" });
        }
        if (genres.includes(book.genre) && bookCheck) {
            // let query = `UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ?`;
            // let params = [book.author_id, book.title, book.pub_year, book.genre, book.id];
            // await db.run(query, params);
            // res.json(book);
            let username = tokenStorage[req.cookies["token"]].username;
            let query = `SELECT * FROM created_by WHERE username = ? AND book_id = ?`;
            let params = [username, book.id];
            console.log("username ", username, " book id ", book.id);
            let createdByCheck = await db.get(query, params);
            if (createdByCheck) {
                let query = `UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ?`;
                let params = [book.author_id, book.title, book.pub_year, book.genre, book.id];
                await db.run(query, params);
                res.json(book);
            } else {
                console.log("Unauthorized user action")
                res.status(403).json({ error: "Unauthorized user action" });
            }
        } else if (!bookCheck) {
            res.status(400).json({ error: "Book id doesn't exist. Add the book first" });
        } else {
            res.status(401).json({ error: "Genre doesn't match given genres. Possible genres include: scifi, adventure, romance, thriller, or action" });
        }
    } catch (error) {
        res.status(500).json({ error: "Catch 500 error" });
    }
});

app.post("/login", async (req, res: LoginResponse) => {
    console.log("server test");
    try {
        let parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res
                .status(400)
                .json({ message: "Username or password invalid" });
        }
        let { username, password } = parseResult.data;
        let validLogin = await db.all(`SELECT * FROM users WHERE username = ?`, [username]);
        if (validLogin.length > 0) {
            console.log(validLogin, " login was valid");
            console.log(validLogin[0].password);
            if (await argon2.verify(validLogin[0].password, password)) {
                console.log("Valid Password argon2 verification");
                let existingToken = Object.keys(tokenStorage).find(key => tokenStorage[key].username === username);
                if (existingToken) {
                    console.log("username already has token in tokenStorage, removing old token");
                    delete tokenStorage[existingToken];
                }
                let token = makeToken();
                tokenStorage[token] = { username };
                res.cookie("token", token, cookieOptions);
                return res.status(200).send();
            } else {
                console.log("Password incorrect");
                return res.status(403).send();
            }
        } else {
            console.log("Invalid login");
            return res.status(403).send();
        }
    } catch {
        return res.status(500).json();
    }
});

app.get('/authorize', (req, res) => {
    // console.log("authorize handler");
    // console.log(req.cookies);
    if (req.cookies["token"] && tokenStorage[req.cookies["token"]]) {
        res.status(200).send(true);
    } else {
        res.status(401).send(false);
    }
});

app.delete('/logout', (req, res) => {
    res.clearCookie("token", cookieOptions).sendStatus(200);
    console.log("cookie clear successfully");
});

app.delete("/api/books", authorize, async (req: Request, res: DeleteResponse) => {
    try {
        let id = req.body.id;
        let username = tokenStorage[req.cookies["token"]].username;
        let query = `SELECT * FROM created_by WHERE username = ? AND book_id = ?`;
        let params = [username, id];
        console.log("username ", username, " book_id ", id);
        let createdByCheck = await db.get(query, params);
        if (createdByCheck) {
            await db.run(`DELETE FROM books WHERE id = ?`, id);
            res.json({ message: "Book deleted successfully" });
        } else {
            console.log("Unauthorized user action")
            res.status(403).json({ error: "Unauthorized user action" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

app.delete("/api/authors", authorize, async (req: Request, res: DeleteResponse) => {
    try {
        let id = req.body.id;
        await db.run(`DELETE FROM authors WHERE id = ?`, id);
        res.json({ message: "Author deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});


app.get('/*', (req, res) => {
    res.sendFile("index.html", { root: publicStaticFolder });
});

let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
