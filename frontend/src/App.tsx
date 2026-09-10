import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CmsApp from './cms/app/CmsApp';

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<CmsApp />} />
      </Routes>
    </Router>
  )
}

export default App
