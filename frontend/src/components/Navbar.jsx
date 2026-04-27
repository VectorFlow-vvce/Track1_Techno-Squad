import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { IoLeafSharp } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {

  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <IoLeafSharp className="navbar-logo-icon" />
          PlantGuard AI
        </NavLink>

        {/* Navigation Links */}
        <ul className="nav-menu">

          <li className="nav-item">
            <NavLink to="/" className="nav-links">
              {t("Home") || "Home"}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/detect" className="nav-links">
              {t("Detection Tool") || "Detection Tool"}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/encyclopedia" className="nav-links">
              {t("Disease Encyclopedia") || "Disease Encyclopedia"}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/about" className="nav-links">
              {t("About") || "About"}
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/contact" className="nav-links">
              {t("Contact") || "Contact"}
            </NavLink>
          </li>

        </ul>


        {/* Language Selector */}
        <div className="language-selector">

          <select
            onChange={(e) => changeLanguage(e.target.value)}
            className="language-dropdown"
          >

            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>

          </select>

        </div>


        {/* Start Detection Button */}
        <div className="nav-button">

          <Link to="/detect" className="nav-button-link">
            {t("Start Detection") || "Start Detection"}
          </Link>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;