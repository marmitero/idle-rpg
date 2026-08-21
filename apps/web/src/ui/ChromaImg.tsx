import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { chromaUrl } from "../chroma";

export function ChromaImg(props: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const { src, ...rest } = props;
  const [url, setUrl] = useState(src);
  useEffect(() => {
    let live = true;
    chromaUrl(src)
      .then((u) => {
        if (live) setUrl(u);
      })
      .catch(() => {
        if (live) setUrl(src);
      });
    return () => {
      live = false;
    };
  }, [src]);
  return <img src={url} alt={rest.alt ?? ""} {...rest} />;
}
