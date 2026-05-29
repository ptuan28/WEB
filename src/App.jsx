import Footer from './components/Footer';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Home from './pages/Home.jsx';
import MyHistory from './pages/MyHistory.jsx';
import QuestionDetail from './pages/QuestionDetail.jsx';
import BugReport from './pages/BugReport.jsx';
import TaiLieu from './pages/TaiLieu.jsx';
import AdminTaiLieu from './pages/AdminTaiLieu.jsx';

function MissingVercelConfig() {
  return (
    <div className='min-h-screen bg-[#1a1a1a] px-4 py-12 text-white'>
      <div className='mx-auto max-w-2xl rounded-xl border border-[#333] bg-[#202020] p-6 shadow-lg'>
        <h1 className='font-lexend text-2xl font-black text-yellow-400'>
          Thieu cau hinh moi truong
        </h1>
        <p className='mt-3 text-sm text-gray-300'>
          Them cac Environment Variables sau trong Vercel Project Settings roi Redeploy:
        </p>
        <pre className='mt-4 overflow-x-auto rounded-lg bg-black p-4 text-sm text-green-300'>
{`VITE_BASE44_APP_ID
VITE_BASE44_APP_BASE_URL
VITE_BASE44_API_KEY
RESEND_API_KEY`}
        </pre>
      </div>
    </div>
  );
}

function App() {
  const missingBase44Config = !import.meta.env.VITE_BASE44_APP_ID || !import.meta.env.VITE_BASE44_API_KEY;

  if (missingBase44Config) {
    return <MissingVercelConfig />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className='min-h-screen flex flex-col bg-[#FFFDF5]'>
          <main className='flex-1'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/history' element={<MyHistory />} />
              <Route path='/question/:questionId' element={<QuestionDetail />} />
              <Route path='/bug-report' element={<BugReport />} />
              <Route path='/tai-lieu' element={<TaiLieu />} />
              <Route path='/admin/tai-lieu' element={<AdminTaiLieu />} />
              <Route path='*' element={<Navigate to='/' />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;