import Image, { ImageProps } from "next/image";
import APusDark from "./alifpustaka-dark-banner-logo.svg";
import APusLight from "./alifpustaka-light-banner-logo.svg";
import APusColorLogo from "./ap-color-logo.svg";

// 1. Define your component props by extending standard Next.js ImageProps
interface TestImageProps extends Partial<ImageProps> {
  className?: string;
}

export const APusLightBanner = ({ className, ...props }: TestImageProps) => {
  return (
    <Image
      className={className}
      src={APusLight}
      alt="Alif Pustaka"
      width={24}
      height={24}
      {...props}
    />
  );
};

export const APusDarkBanner = ({ className, ...props }: TestImageProps) => {
  return (
    <Image
      className={className}
      src={APusDark}
      alt="Alif Pustaka"
      width={24}
      height={24}
      {...props}
    />
  );
};

export const APusColorSquare = ({ className, ...props }: TestImageProps) => {
  return (
    <Image
      className={className}
      src={APusColorLogo}
      alt="Alif Pustaka"
      width={24}
      height={24}
      {...props}
    />
  );
};
