import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

interface Book {
    id: string;
    author_id: string;
    title: string;
    pub_year: string;
    genre: string;
}

const Books = () => {
    const [addBook, setAddBook] = useState<Book>({ id: '', author_id: '', title: '', pub_year: '', genre: '' });
    const [editBook, setEditBook] = useState<Book>({ id: '', author_id: '', title: '', pub_year: '', genre: '' });

    const [books, setBooks] = useState<Book[]>([]);
    const [message, setMessage] = useState<string>('');
    const [searchTitle, setSearchTitle] = useState('');

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTitle(event.target.value);
    };

    const handleSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.form && event.target.form.className === 'addBooksForm') {
            setAddBook({ ...addBook, [event.target.name]: event.target.value });
        } else if (event.target.form && event.target.form.className === 'editBooksForm') {
            setEditBook({ ...editBook, [event.target.name]: event.target.value });
        }
    };



    const handleAddBook = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addBook),
            });
            if (response.status == 400) {
                setMessage('Error, author id doesnt match existing ID');
            } else if (response.status == 401) {
                setMessage('Error, genre isnt included in list of possible genres. Possible genres include Action, Adventure, Romance, Scifi, and Thriller');
            } else {
                const data = await response.json();
                console.log('Book added: ', data);
                setBooks([...books, addBook]);
                setMessage('Book added successfully');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error, couldnt add book');
        }
    };

    const handleEditBook = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/books', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editBook),
            });
            if (response.status == 400) {
                setMessage('Error, author id doesnt match existing ID');
            } else if (response.status == 401) {
                setMessage('Error, genre isnt included in list of possible genres. Possible genres include Action, Adventure, Romance, Scifi, and Thriller');
            } else if (response.status == 402) {
                setMessage('Error, blank inputs not allowed');
            } else {
                const data = await response.json();
                console.log('Book edited: ', data);
                setMessage('Book edited successfully');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error, couldnt edit book');
        }
    };

    const handleDeleteBook = async () => {
        try {
            const response = await fetch('/api/books', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editBook),
            });
            if (response.ok) {
                console.log('Book deleted successfully');
                setMessage('Book deleted successfully');
            } else {
                console.error('Error deleting book');
                setMessage('Error deleting book');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error deleting book');
        }
    };



    useEffect(() => {
        const getBooks = async () => {
            const response = await fetch('/api/books');
            const data = await response.json();
            setBooks(data);
        };
        getBooks();
    }, [books]);

    return (
        <>
            <div className="content">
                <div className="forms">
                    <form onSubmit={handleAddBook} className="addBooksForm">
                        <h4>Add Book Form</h4>
                        <div>
                            <label htmlFor="author_id">Author ID:</label>
                            <input type="text" name="author_id" value={addBook.author_id} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="title">Book Title:</label>
                            <input type="text" name="title" value={addBook.title} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="pub_year">Publication Year:</label>
                            <input type="text" name="pub_year" value={addBook.pub_year} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="genre">Genre:</label>
                            <input type="text" name="genre" value={addBook.genre} onChange={handleSubmit} />
                        </div>
                        <Button variant="contained" type="submit" style={{ backgroundColor: 'green' }}>Add Book</Button>
                    </form>

                    <form onSubmit={handleEditBook} className="editBooksForm">
                        <h4>Edit/Delete Book Form</h4>
                        <div>
                            <label htmlFor="id">Book ID:</label>
                            <input type="text" name="id" value={editBook.id} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="author_id">Author ID:</label>
                            <input type="text" name="author_id" value={editBook.author_id} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="title">Book Title:</label>
                            <input type="text" name="title" value={editBook.title} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="pub_year">Publication Year:</label>
                            <input type="text" name="pub_year" value={editBook.pub_year} onChange={handleSubmit} />
                        </div>
                        <div>
                            <label htmlFor="genre">Genre:</label>
                            <input type="text" name="genre" value={editBook.genre} onChange={handleSubmit} />
                        </div>
                        <Button variant="contained" type="submit" style={{ backgroundColor: 'green' }}>Edit Book</Button>
                        <br />
                        <Button variant="contained" type="button" onClick={handleDeleteBook} style={{ backgroundColor: 'green' }}>Delete Book</Button>

                    </form>

                </div>
                <div className="message">{message}</div>
                <br />
                <br />
                <br />
                <br />
                <label htmlFor="titleSearch">Search By Title</label>
                <input type="text" name="titleSearch" value={searchTitle} onChange={handleSearch} />
                <table className="booksTable">
                    <thead>
                        <tr>
                            <th>Book ID</th>
                            <th>Author ID</th>
                            <th>Title</th>
                            <th>Publication Year</th>
                            <th>Genre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books
                            .filter(book => book.title.toLowerCase().includes(searchTitle.toLowerCase()))
                            .map((book) => (
                                <tr key={book.id}>
                                    <td>{book.id}</td>
                                    <td>{book.author_id}</td>
                                    <td>{book.title}</td>
                                    <td>{book.pub_year}</td>
                                    <td>{book.genre}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Books;
