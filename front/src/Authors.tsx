import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';

interface Author {
    id: string;
    name: string;
    bio: string;
}

const Authors = () => {
    const [author, setAuthor] = useState<Author>({ id: '', name: '', bio: '' });
    const [authors, setAuthors] = useState<Author[]>([]);
    const [message, setMessage] = useState<string>('');

    const handleSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAuthor({ ...author, [event.target.name]: event.target.value });
    };

    const handleAddAuthor = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/authors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(author),
            });
            if (response.status == 400) {
                setMessage('Error, author name already exists or name is invalid, must be between 1 and 25 characters');

            } else {
                console.log(response.status);
                const data = await response.json();
                console.log('Author added: ', data);
                setAuthors([...authors, author]);
                setMessage('Author added successfully');
            }
        } catch (error) {
            console.error(error);
            setMessage('Error, couldnt add author');
        }
    };

    useEffect(() => {
        const getAuthors = async () => {
            const response = await fetch('/api/authors');
            const data = await response.json();
            setAuthors(data);
        };
        getAuthors();
    }, [authors]);

    return (
        <>
            <div className="content">
                <form onSubmit={handleAddAuthor} className="addAuthorsForm">
                    <h4>Add Author Form</h4>
                    <div>
                        <label htmlFor="name">Author's Name:</label>
                        <input type="text" name="name" value={author.name} onChange={handleSubmit} />
                    </div>
                    <div>
                        <label htmlFor="bio">Author's Bio:</label>
                        <input type="text" name="bio" value={author.bio} onChange={handleSubmit} />
                    </div>

                    <Button variant="contained" type="submit" style={{ backgroundColor: 'green' }}>Add Author</Button>
                </form>
                <div className="message">{message}</div>
                <table className="authorsTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Author's Name</th>
                            <th>Author's Bio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {authors.map((author) => (
                            <tr key={author.id}>
                                <td>{author.id}</td>
                                <td>{author.name}</td>
                                <td>{author.bio}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Authors;
