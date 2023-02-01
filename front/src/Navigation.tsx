import { Link } from "react-router-dom"
const Navigation = () => {
    return (
        <nav className="nav">
            <h1>Bamazon Books</h1>
            <a href="/" className="title">
                Bamazon Books
            </a>
            <ul>
                <li>
                    <Link to="/api/authors">Authors</Link>
                </li>
                <li>
                    <Link to="/api/books">Books</Link>
                </li>
            </ul>
        </nav>
    );
}


export default Navigation;