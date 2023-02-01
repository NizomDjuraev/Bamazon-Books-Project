import React, { useState, useEffect } from 'react';

interface Book {
    id: string;
    author_id: string;
    title: string;
    pub_year: string;
    genre: string;
}

const Books = () => {
    const [book, setBook] = useState<Book>({ id: '', author_id: '', title: '', pub_year: '', genre: '' });
    const [books, setBooks] = useState<Book[]>([]);
    const [message, setMessage] = useState<string>('');
    const [searchTitle, setSearchTitle] = useState('');

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTitle(event.target.value);
    };

    const handleSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBook({ ...book, [event.target.name]: event.target.value });
    };

    const handleAddBook = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(book),
            });
            if (response.status == 400) {
                setMessage('Error, author id doesnt match existing ID');
            } else if (response.status == 401) {
                setMessage('Error, genre isnt included in list of possible genres. Possible genres include Action, Adventure, Romance, Scifi, and Thriller');
            } else {
                const data = await response.json();
                console.log('Book added: ', data);
                setBooks([...books, book]);
                setMessage('Book added successfully');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error, couldnt add book');
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
                <form onSubmit={handleAddBook} className="addBooksForm">
                    <div>
                        <label htmlFor="author_id">Author ID:</label>
                        <input type="text" name="author_id" value={book.author_id} onChange={handleSubmit} />
                    </div>
                    <div>
                        <label htmlFor="title">Book Title:</label>
                        <input type="text" name="title" value={book.title} onChange={handleSubmit} />
                    </div>
                    <div>
                        <label htmlFor="pub_year">Publication Year:</label>
                        <input type="text" name="pub_year" value={book.pub_year} onChange={handleSubmit} />
                    </div>
                    <div>
                        <label htmlFor="genre">Genre:</label>
                        <input type="text" name="genre" value={book.genre} onChange={handleSubmit} />
                    </div>
                    <button type="submit">Add Book</button>
                </form>
                <div className="message">{message}</div>
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
