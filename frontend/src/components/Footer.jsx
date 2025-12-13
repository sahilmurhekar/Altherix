import React from 'react'
import FooterLogo from '../assets/footerlogo.png'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
const Footer = () => {
  return (
    <div className='flex flex-col'>
    <footer className="text-zinc-400  border-t border-base-300 backdrop-blur-3xl p-10">
        <div className='footer sm:footer-horizontal  max-w-7xl mx-auto'>
  <aside>
    <img className="fill-current" width="50" height="50" src={FooterLogo} alt="" />
    <p>
      Altherix Healthcare Solutions Pvt. Ltd.
    </p>
    <div className='flex flex-row items-start justify-center gap-2'>
        <a href='#'><Facebook className='h-5 w-5 hover:text-blue-500 hover:scale-105 transition-all duration-300'/></a>
        <a href='#'><Instagram className='h-5 w-5 hover:text-red-500 hover:scale-105 transition-all duration-300'/></a>
        <a href='#'><Linkedin className='h-5 w-5 hover:text-blue-500 hover:scale-105 transition-all duration-300'/></a>
        <a href='#'><Twitter className='h-5 w-5 hover:text-cyan-500 hover:scale-105 transition-all duration-300'/></a>
    </div>
  </aside>
  <nav>
    <h6 className="footer-title text-zinc-200">Services</h6>
    <a href='#solutions' className="link link-hover">Features</a>
    <a href='#patients' className="link link-hover">For Patients</a>
    <a href='#doctors' className="link link-hover">For Doctors</a>
    <a href='#trust' className="link link-hover">Trust & Credibility</a>
    <a href='#tech' className="link link-hover">Technology</a>
  </nav>
  <nav>
    <h6 className="footer-title text-zinc-200">Company</h6>
    <a href='#problems' className="link link-hover">Problems Faced</a>
    <a href='#how' className="link link-hover">How it Works?</a>
    <a href='#compare' className="link link-hover">Why Us?</a>
    <a href='#faqs' className="link link-hover">FAQs</a>
    <a href='#contact' className="link link-hover">Contact Us</a>
  </nav>
  <nav>
    <h6 className="footer-title text-zinc-200">Legal</h6>
    <a href='/terms' className="link link-hover">Terms of use</a>
    <a href='/privacy' className="link link-hover">Privacy policy</a>
  </nav>
</div>
</footer>
<div className='px-[5%] flex flex-col items-start md:items-center justify-center w-full border-t border-base-300 backdrop-blur-md py-4'>
    <p className='my-1 text-center text-xs text-zinc-400'>Copyright © 2025 Altherix Healthcare Solutions Pvt. Ltd.- All right reserved</p>
</div>
</div>
  )
}

export default Footer
