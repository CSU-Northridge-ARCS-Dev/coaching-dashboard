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
      <div className="tw-flex tw-justify-between tw-w-full tw-px-8 mb-4">
        <p className="tw-text-white tw-text-2xl">
          Once a Matador, Always a Matador
        </p>
        <p className="tw-text-xl tw-text-white">
          Copyright &copy; California State University, Northridge
        </p>
      </div>
      <div className="tw-flex tw-justify-end tw-w-full tw-pr-32">
        <a
          href="https://www.youtube.com/user/northridgeathletics"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faYoutube}
            className="tw-text-white tw-mb-2 tw-mr-4 tw-w-12 tw-h-12 hover:tw-text-red-700"
          />
        </a>
        <a
          href="https://www.instagram.com/GoMatadors/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faInstagram}
            className="tw-text-white tw-mb-2 tw-mr-4 tw-w-12 tw-h-12 hover:tw-text-red-700"
          />
        </a>
        <a
          href="https://twitter.com/GoMatadors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faTwitter}
            className="tw-text-white tw-mb-2 tw-mr-4 tw-w-12 tw-h-12 hover:tw-text-red-700"
          />
        </a>
        <a
          href="https://www.facebook.com/CSUNAthletics"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faFacebook}
            className="tw-text-white tw-mb-2 tw-w-12 tw-h-12 hover:tw-text-red-700"
            target="_blank"
            rel="noopener noreferrer"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
