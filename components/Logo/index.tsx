import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  link?: boolean;
};

export const Logo = ({ link = false }: LogoProps) => {
  const logo = (
    <Image
      src="/logo/vellum-logo.png"
      alt="Vellum logo"
      width={78}
      height={75}
    />
  );
  return (
    <div className="w-32 m-2">
      {link ? <Link href="/homepage"> {logo} </Link> : logo}
    </div>
  );
};
