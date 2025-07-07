import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-white tw-py-4">
      <div className="tw-flex tw-space-x-12 tw-mb-4">
        <FontAwesomeIcon icon={faInstagram} size="3x" />
        <FontAwesomeIcon icon={faTwitter} size="3x" />
        <FontAwesomeIcon icon={faYoutube} size="3x" />
        <FontAwesomeIcon icon={faFacebook} size="3x" />
      </div>
      <div className="tw-text-center tw-text-3xl">
        Copyright © California State University Northridge
      </div>
    </div>
  );
};

export default Footer;
