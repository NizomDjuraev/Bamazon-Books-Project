import axios from "axios";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;
async function clearTables() {
    db.run("DELETE FROM authors");
    db.run("DELETE FROM books");
}
beforeEach(() => {
    clearTables();
});
// test("GET from /api/authors returns authors", async () => {
//     let author = { id: "1", name: "John", bio: "Old" };
//     await axios.post(`${baseUrl}/api/authors`, author);
//     let { data } = await axios.get(`${baseUrl}/api/authors`);
//     expect(data).toEqual([{ id: "1", name: "John", bio: "Old" }]);
// });
// test("GET /api/books returns books", async () => {
//     let author = { id: "2", name: "Fry", bio: "Older" };
//     await axios.post(`${baseUrl}/addtoauthors`, author);
//     let book = { id: "2", author_id: "2", title: "Expensive Book", pub_year: "1900", genre: "adventure" };
//     await axios.post(`${baseUrl}/addtobooks`, book);
//     let { data } = await axios.get(`${baseUrl}/api/books`);
//     expect(data).toEqual([{ id: "2", author_id: "2", title: "Expensive Book", pub_year: "1900", genre: "adventure" }]);
// });
// test("POST to /api/authors works", async () => {
//     let author = { id: "1", name: "John", bio: "Old" };
//     let result = await axios.post(`${baseUrl}/api/authors`, { author });
//     expect(result.data).toEqual({ author });
// });
// test("POST to /api/books works", async () => {
//     let author = { id: "1", name: "John", bio: "Old" };
//     await axios.post(`${baseUrl}/addtoauthors`, author);
//     let book = { id: "1", author_id: "1", title: "Best Book", pub_year: "2000", genre: "scifi" };
//     let result = await axios.post(`${baseUrl}/api/books`, book);
//     expect(result.data).toEqual(book);
// });
// test("DELETE /api/author deletes author", async () => {
//     let author = { id: "1", name: "John", bio: "Old" };
//     await axios.post(`${baseUrl}/addtoauthors`, author);
//     await axios.delete(`${baseUrl}/deleteauthor`, { data: { id: "1" } });
//     let { data } = await axios.get(`${baseUrl}/api/authors`);
//     expect(data).toEqual([]);
// });
// test("DELETE /api/book deletes a book and returns message", async () => {
//     let author = { id: "1", name: "John", bio: "Old" };
//     await axios.post(`${baseUrl}/api/authors`, author);
//     let book = { id: "1", author_id: "1", title: "Best Book", pub_year: "2000", genre: "scifi" };
//     await axios.post(`${baseUrl}/api/books`, book);
//     let result = await axios.delete(`${baseUrl}/api/book`, { data: { id: "1" } });
//     expect(result.data).toEqual({ message: "Book deleted successfully" });
//     let { data } = await axios.get(`${baseUrl}/api/books`);
//     expect(data).toEqual([]);
// });
//tried posting to insert but ended up inserting directly with the next test. 
test("updates a book with a valid id, title, pub_year, and genre", async () => {
    const book = { id: "1", author_id: "1", title: "Old Book", pub_year: "2000", genre: "scifi" };
    await axios.post(`${baseUrl}/api/books, book`);
    const updatedBook = { id: "1", author_id: "1", title: "New Book", pub_year: "2020", genre: "action" };
    const response = await axios.put(`${baseUrl}/api/books, updatedBook`);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedBook);
});
//very frustrated, the test should be running, I keep getting the sqlite constraint error. Author is INSERTED, then BOOK IS INSERTED based on the correct ID!!!!!!!!
test("updates a book with a valid id, title, pub_year, and genre", async () => {
    await db.run(`INSERT INTO authors (id, name, bio) VALUES (?, ?, ?)`, ["1", "John", "Old"]);
    await db.run(`INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?);`, ["1", "1", "GoodBook", "2000", "Action"]);
    const updatedBook = { id: "1", author_id: "1", title: "New Book", pub_year: "2020", genre: "Action" };
    const response = await axios.put(`${baseUrl}/api /books`, updatedBook);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(updatedBook);
});
//whyyyyyyyyyyy wont it passs
test("returns a 400 error for book id not found", async () => {
    const book = { author_id: "50", title: "New Book", pub_year: "2020", genre: "Action" };
    await db.run(`INSERT INTO authors (id, name, bio) VALUES (?, ?, ?)`, [1, "John", "Old"]);
    await db.run(`INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?);`, ["1", "1", "GoodBook", "2000", "Action"]);
    const response = await axios.put(`${baseUrl}/api/books`, book);
    expect(response.status).toBe(400);
    expect(response.data).toEqual({ error: "Book id doesn't exist. Add the book first" });
});
// test("GET /foo?bar returns message", async () => {
//     let bar = "xyzzy";
//     let { data } = await axios.get(`${baseUrl}/foo?bar=${bar}`);
//     expect(data).toEqual({ message: `You sent: ${bar} in the query` });
// });
// test("GET /foo returns error", async () => {
//     try {
//         await axios.get(`${baseUrl}/foo`);
//     } catch (error) {
//         // casting needed b/c typescript gives errors "unknown" type
//         let errorObj = error as AxiosError;
//         // if server never responds, error.response will be undefined
//         // throw the error so typescript can perform type narrowing
//         if (errorObj.response === undefined) {
//             throw errorObj;
//         }
//         // now, after the if-statement, typescript knows
//         // that errorObj can't be undefined
//         let { response } = errorObj;
//         // TODO this test will fail, replace 300 with 400
//         expect(response.status).toEqual(300);
//         expect(response.data).toEqual({ error: "bar is required" });
//     }
// });
// test("POST /bar works good", async () => {
//     let bar = "xyzzy";
//     let result = await axios.post(`${baseUrl}/foo`, { bar });
//     expect(result.data).toEqual({ message: `You sent: ${bar} in the body` });
// });
