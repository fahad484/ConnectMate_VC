import {BrowserRouter ,Routes ,Route} from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication.jsx';
import VideoMeet from './pages/VideoMeet.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/auth' element={<Authentication/>}/>
        <Route path='/:url' element={<VideoMeet/>}/>
      </Routes>
    </BrowserRouter>

  );
}

export default App;
