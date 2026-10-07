import React from 'react'
import "../App.css"
import {Link} from "react-router-dom"

const LandingPage = ()=> {
  return (
    <div className='landingPageContainer'>
      <nav className='container-nav'>
        <div className='nav-header'>ConnectMate</div>
        <div className='nav-options'>
          <Link to={"/guest"}>Join as Guest</Link>
          <Link to={"/register"}>Register</Link>
          <Link to={"/login"} className='buttonstyle'>Login</Link>
        </div>
      </nav>
      <div className='container-main'>
        <div className='content'>
          <h2><span style={{color:"orange"}}>Connect</span> with your Loved Ones</h2>
          <p>Start real-time conversations with people miles away</p>
          <Link to={"/auth"} style={{textDecoration:"none",color:"white"}}>
            <button className='buttonstyle '>Get Started</button>
          </Link>
          
        </div>
        <div>
          <img src="/mobile.png" alt='heroimg'/>
        </div>
      </div>
    </div>
  )
}

export default LandingPage;