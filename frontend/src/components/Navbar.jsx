import React from 'react'
import Logo from '../assets/logo.png'

const Navbar = () => {
  return (
    <div className='w-full fixed top-0 left-0 z-50 flex justify-center animate-float'>
      <div className='max-w-7xl w-full px-4 sm:px-6 lg:px-8'>
        <div className="navbar rounded-2xl mt-4 bg-base-200/40 backdrop-blur-md shadow-xl px-4">
          <div className="navbar-start">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost mr-2 lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </div>
              <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content rounded-box z-1 mt-3 w-60 p-2 shadow-lg backdrop-blur-md bg-base-200/40 rounded-lg"
              >
                <li><a>Home</a></li>
                <li>
                  <details>
                    <summary>About Us</summary>
                    <ul className="p-2">
                      <li><a>Problem we solve</a></li>
                      <li><a>For Doctors</a></li>
                      <li><a>For Patients</a></li>
                      <li><a>How it works?</a></li>
                    </ul>
                  </details>
                </li>
                <li><a>FAQs</a></li>
                <li><a>Contact Us</a></li>
                <li><a>Login</a></li>
                <li><a>Register</a></li>
              </ul>
            </div>
            <a href="/" className="flex flex-row gap-2 font-black items-center">
              <img className='h-6 rounded-sm' src={Logo} alt="logo" /> ALTHERIX
            </a>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-4">
              <li><a>Home</a></li>
              <li>
                <details>
                  <summary>About Us</summary>
                  <ul className="bg-base-200/40 p-2 w-60 backdrop-blur-md rounded-lg shadow-lg">
                    <li><a>Problem we solve</a></li>
                    <li><a>For Doctors</a></li>
                    <li><a>For Patients</a></li>
                    <li><a>How it works?</a></li>
                  </ul>
                </details>
              </li>
              <li><a>FAQs</a></li>
              <li><a>Contact Us</a></li>
            </ul>
          </div>
          <div className="navbar-end gap-2 hidden sm:flex">
            <a href="/login" className="btn btn-ghost">Login</a>
            <a href="/register" className="btn border-none bg-gradient-to-r from-purple-800 to-blue-500 text-white hover:shadow-lg hover:from-purple-700 hover:to-blue-600 hover:scale-105 transition-all duration-500 ease-in-out">Register</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
