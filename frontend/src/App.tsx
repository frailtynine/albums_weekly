import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Nav/Login';
import ClippedDrawer from './Components/Nav/Drawer';

function App() {
  
  return (
    <Router>
        <Routes>
            <Route path="" element={<Login />} />
            <Route path="/cms" element={<ClippedDrawer />} />
        </Routes>
    </Router>
  )
}

export default App