import Image from "next/image";

interface Props {
  src: string;
  alt: string;
}

export function CardIcon({ src, alt }: Props) {
  return <Image src={src} alt={alt} width={60} height={60} />;
}

export function DashLogo() {
  return <Image src="dashlogo.png" alt="dash logo" priority={true} />;
}
