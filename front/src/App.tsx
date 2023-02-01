
import './App.css';
import Navigation from './Navigation';
import Authors from './Authors';
import Books from './Books';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="Pages">
          <Routes>
            <Route path="/api/authors" element={<Authors />}>
            </Route>
            <Route path="/api/books" element={<Books />}>
            </Route>
          </Routes>
        </div>
        <p>
          Bamazon Books Landing Page
        </p>
      </div>
    </Router>
  );
}

export default App;
