import axios, { AxiosError } from "axios";
import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
import { clear } from "console";

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

afterEach(() => {
    clearTables();
});
beforeEach(() => {
    clearTables();
})


test("GET from getauthors returns authors", async () => {
    let author = { id: "1", name: "John", bio: "Old" };
    await axios.post(`${baseUrl}/addtoauthors`, author);
    let { data } = await axios.get(`${baseUrl}/getauthors`);
    expect(data).toEqual([{ id: "1", name: "John", bio: "Old" }]);
});

test("GET /getbooks returns books", async () => {
    let author = { id: "2", name: "Fry", bio: "Older" };
    await axios.post(`${baseUrl}/addtoauthors`, author);
    let book = { id: "2", author_id: "2", title: "Expensive Book", pub_year: "1900", genre: "adventure" };
    await axios.post(`${baseUrl}/addtobooks`, book);
    let { data } = await axios.get(`${baseUrl}/getbooks`);
    expect(data).toEqual([{ id: "2", author_id: "2", title: "Expensive Book", pub_year: "1900", genre: "adventure" }]);
});

test("POST to addtoauthors works", async () => {
    let author = { id: "1", name: "John", bio: "Old" };
    let result = await axios.post(`${baseUrl}/addtoauthors`, { author });
    expect(result.data).toEqual({ author });
});

test("POST to addtobooks works", async () => {
    let author = { id: "1", name: "John", bio: "Old" };
    await axios.post(`${baseUrl}/addtoauthors`, author);
    let book = { id: "1", author_id: "1", title: "Best Book", pub_year: "2000", genre: "scifi" };
    let result = await axios.post(`${baseUrl}/addtobooks`, book);
    expect(result.data).toEqual(book);
});

test("DELETE /deleteauthor deletes author", async () => {
    let author = { id: "1", name: "John", bio: "Old" };
    await axios.post(`${baseUrl}/addtoauthors`, author);
    await axios.delete(`${baseUrl}/deleteauthor`, { data: { id: "1" } });
    let { data } = await axios.get(`${baseUrl}/getauthors`);
    expect(data).toEqual([]);
});

test("DELETE /deletebook deletes a book and returns message", async () => {
    let author = { id: "1", name: "John", bio: "Old" };
    await axios.post(`${baseUrl}/addtoauthors`, author);
    let book = { id: "1", author_id: "1", title: "Best Book", pub_year: "2000", genre: "scifi" };
    await axios.post(`${baseUrl}/addtobooks`, book);
    let result = await axios.delete(`${baseUrl}/deletebook`, { data: { id: "1" } });
    expect(result.data).toEqual({ message: "Book deleted successfully" });
    let { data } = await axios.get(`${baseUrl}/getbooks`);
    expect(data).toEqual([]);
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
