import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Check if token exists in localStorage (or cookies if you're using them)
    const token = localStorage.getItem('token'); // Adjust if you're using cookies
    setIsLoggedIn(!!token); // If token exists, user is logged in
  }, []); // Runs only once on mount

  const handleLogout = () => {
    // Remove token from localStorage or cookies
    localStorage.clear();
    setIsLoggedIn(false);
    
    // Redirect to login page
    router.push('/auth/signin'); // Change to your login page path
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">MyBooksExchange</Link>
      </div>
      <div className="search-container">
        <input type="text" placeholder="Search..." />
        <button type="submit">Search</button>
      </div>
      <ul className="nav-links">
        {isLoggedIn ? (
          <>
            <li className="dropdown">
              <a href="#" className="dropdown-toggle">
                More Option
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link legacyBehavior href="/dropdown-item-1">
                    <a>About Us</a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/dropdown-item-2">
                    <a>Contact</a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/dropdown-item-2">
                    <a>Company</a>
                  </Link>
                </li>
                <li>
                  <Link legacyBehavior href="/service">
                    <a>Services</a>
                  </Link>
                </li>
              </ul>
            </li>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/components/post">Posts</Link></li>
            <li><Link href="#portfolio">Library</Link></li>
            <li><Link href="#contact">Books</Link></li>
            <li><Link href="/components/profile/">Profile</Link></li>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <li><Link href="/auth/signup">Signup</Link></li>
            <li><Link href="/auth/signin">Signin</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
