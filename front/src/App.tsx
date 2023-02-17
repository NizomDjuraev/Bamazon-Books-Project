
import './App.css';
import Navigation from './Navigation';
import Authors from './Authors';
import Books from './Books';
import Login from './Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="Pages">
          <Routes>
            <Route path="/" element={<Login />}>
            </Route>
            <Route path="/Login" element={<Login />}>
            </Route>
            <Route path="/Authors" element={<Authors />}>
            </Route>
            <Route path="/Books" element={<Books />}>
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
