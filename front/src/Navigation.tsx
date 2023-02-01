const Navigation = () => {
    return (
        <nav className="nav">
            <a href="/" className="title">
                Bamazon Books
            </a>
            <ul>
                <li>
                    <a href="/api/authors">Authors</a>
                </li>
                <li>
                    <a href="/api/books">Books</a>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;