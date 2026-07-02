import Google from "./google.svg";
import Github from "./github.svg";
import Image, { ImageProps } from "next/image";
import { SVGProps } from "react";

// 1. Define your component props by extending standard Next.js ImageProps
interface TestImageProps extends Partial<ImageProps> {
  className?: string;
}

export const GoogleIcon = ({ className, ...props }: TestImageProps) => {
  return (
    <Image
      className={className}
      src={Google}
      alt="Google Icon"
      width={24}
      height={24}
      {...props}
    />
  );
};

export const GithubIcon = ({ className, ...props }: TestImageProps) => {
  return (
    <Image
      className={className}
      src={Github}
      alt="Github Icon"
      width={24}
      height={24}
      {...props}
    />
  );
};
