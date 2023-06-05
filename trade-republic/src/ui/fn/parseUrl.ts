type ParseUrlResult = {
  page: "login" | "home" | "instrument" | "unknown";
  instrumentId?: string;
};

export function parseUrl(location: string): ParseUrlResult {
  const path = getPath(location);
  const lowerPath = path.toLowerCase();
  if (lowerPath == "") {
    return { page: "home" };
  }

  if (lowerPath == "login") {
    return { page: "login" };
  }

  if (lowerPath.startsWith("instrument")) {
    let instrumentId = "";
    const splash = path.indexOf("/");
    if (splash != -1 && splash + 1 < path.length) {
      instrumentId = path.substring(splash + 1);
    }
    return { page: "instrument", instrumentId: instrumentId };
  }

  return { page: "unknown" };
}

function getPath(location: string): string {
  const endOfProtocol = location.indexOf("//");
  if (endOfProtocol == -1 || endOfProtocol + 2 >= location.length) {
    return "";
  }
  const base = location.substring(endOfProtocol + 2);
  const nextSplash = base.indexOf("/");
  if (nextSplash == -1 || nextSplash + 1 >= base.length) {
    return "";
  }
  const path = base.substring(nextSplash + 1);
  const questionMark = path.indexOf("?");
  if (questionMark != -1) {
    return path.substring(0, questionMark);
  }
  return path;
}
