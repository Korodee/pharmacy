import Image from "next/image";

export default function HeroImage() {
  return (
    <div className="relative w-full h-full flex items-end justify-center">
      <div className="relative z-10">
        <Image
          src="/hero-img.png"
          alt="Professional pharmacist"
          width={1600}
          height={2000}
          className="object-contain object-bottom w-[110%] max-w-none"
          priority
        />
      </div>
    </div>
  );
}
