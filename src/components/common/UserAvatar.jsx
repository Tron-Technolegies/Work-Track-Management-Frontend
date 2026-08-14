import React, { useState, useEffect } from "react";

const DEFAULT_AVATAR = "/user icon.svg";

const UserAvatar = ({
  src,
  alt = "User",
  className = "",
  style = {},
  defaultSrc = DEFAULT_AVATAR,
  onError,
}) => {
  const [imgSrc, setImgSrc] = useState(() => src || defaultSrc);

  useEffect(() => {
    setImgSrc(src || defaultSrc);
  }, [src, defaultSrc]);

  const handleError = (e) => {
    if (imgSrc !== defaultSrc) {
      setImgSrc(defaultSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={imgSrc || defaultSrc}
      alt={alt || "User"}
      className={className}
      style={{
        objectFit: "cover",
        flexShrink: 0,
        ...style,
      }}
      onError={handleError}
    />
  );
};

export default UserAvatar;
