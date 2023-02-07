import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Navigation = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ padding: "10px 200px", width: '150px' }}>Bamazon Books</Typography>
                <Button color="inherit" component={Link} to="/api/authors" style={{ width: '150px' }}>
                    Authors
                </Button>
                <Button color="inherit" component={Link} to="/api/books" style={{ width: '150px' }}>
                    Books
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
