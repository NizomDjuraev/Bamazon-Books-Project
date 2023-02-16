import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

let Navigation = () => {
    let [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        let fetchAuthorization = async () => {
            try {
                let response = await fetch('/authorize');
                let isAuthorized = await response.json();
                setLoggedIn(isAuthorized);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAuthorization();
    }, []);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ padding: "10px 200px", width: '150px' }}>Bamazon Books</Typography>
                {loggedIn && (
                    <>
                        <Button color="inherit" component={Link} to="/api/authors" style={{ width: '150px' }}>
                            Authors
                        </Button>
                        <Button color="inherit" component={Link} to="/api/books" style={{ width: '150px' }}>
                            Books
                        </Button>
                    </>
                )}
                {(
                    <Button color="inherit" component={Link} to="/login" style={{ width: '150px' }}>
                        Account
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
