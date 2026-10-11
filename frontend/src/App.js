import {BrowserRouter ,Routes ,Route} from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication.jsx';
import VideoMeet from './pages/VideoMeet.jsx';
import HomeComponent from './pages/HomeComponent.jsx';
import History from './pages/History.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
       <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/auth' element={<Authentication/>}/>
        <Route path='/login' element={<Authentication/>}/>
        <Route path='/register' element={<Authentication  isRegister={true}/>}/>
        <Route path='/home' element={<HomeComponent/>}/>
        <Route path='/history' element={<History/>}/>
        <Route path='/:url' element={<VideoMeet/>}/>
        
      </Routes>
    </AuthProvider>
     
    </BrowserRouter>

  );
}

export default App;
