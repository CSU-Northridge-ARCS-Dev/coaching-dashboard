import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faTwitter,
  faFacebook,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="tw-bg-black tw-py-10 tw-flex tw-flex-col tw-items-center">
      <div className="tw-flex tw-justify-center">
        <a
          href="https://www.youtube.com/user/northridgeathletics"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faYoutube}
            className="tw-text-blue-600 tw-mb-2 tw-mr-4 tw-w-12 tw-h-12 hover:tw-text-red-300 hover:tw-w-16 hover:tw-h-16 transition duration-300"
          />
        </a>
        <a
          href="https://www.instagram.com/GoMatadors/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faInstagram}
            className="tw-text-blue-600 tw-mb-2 tw-mr-4 tw-w-12 tw-h-12 hover:tw-text-red-300 hover:tw-w-16 hover:tw-h-16 transition duration-300"
          />
        </a>
        <a
          href="https://twitter.com/GoMatadors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faTwitter}
            className="tw-text-blue-600 tw-mb-2 tw-mr-4 tw-w-12 tw-h-12 hover:tw-text-red-300 hover:tw-w-16 hover:tw-h-16 transition duration-300"
          />
        </a>
        <a
          href="https://www.facebook.com/CSUNAthletics"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faFacebook}
            className="tw-text-blue-600 tw-mb-2 tw-w-12 tw-h-12 hover:tw-text-red-300 hover:tw-w-16 hover:tw-h-16 transition duration-300"
            target="_blank"
            rel="noopener noreferrer"
          />
        </a>
      </div>
      <p className="tw-text-xl tw-text-white">
        Copyright &copy; California State University, Northridge
      </p>
    </footer>
  );
};

export default Footer;
