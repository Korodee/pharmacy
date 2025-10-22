import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-2">
        <Image
          src="/logo.svg"
          alt="Kateri Pharmacy Logo"
          width={160}
          height={60}
          className="h-8 md:h-10 w-auto"
          priority
        />
      </div>
    </div>
  );
}
