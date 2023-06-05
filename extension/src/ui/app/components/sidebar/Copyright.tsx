import React from "react";

type Props = {
  sidebar: boolean;
  version?: string;
};

export default function Copyright({ sidebar, version }: Props) {
  const year = new Date().getFullYear();
  let className = "sidebar-card copyright text-secondary d-none d-sm-none d-md-block";
  if (!sidebar) {
    className = "copyright text-secondary d-block d-sm-block d-md-none d-lg-none d-xl-none d-xxl-none";
  }

  return (
    <div className={className}>
      <a target="_blank" href="https://portfolio-manager-extension.com/" className="text-decoration-none">
        Portfolio Manager Extension
      </a>
      {typeof version == "undefined" ? " " : " " + version + " "}© {year}
    </div>
  );
}
