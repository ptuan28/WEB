import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Home from './pages/Home.jsx';
import MyHistory from './pages/MyHistory.jsx';
import QuestionDetail from './pages/QuestionDetail.jsx';
import BugReport from './pages/BugReport.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/history' element={<MyHistory />} />
          <Route path='/question/:questionId' element={<QuestionDetail />} />
          <Route path='/bug-report' element={<BugReport />} />
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

