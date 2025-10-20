import { HeroContent as HeroContentType } from "@/lib/data/heroData";
import Button from "./Button";

interface HeroContentProps {
  content: HeroContentType;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export default function HeroContent({ content, isModalOpen, setIsModalOpen }: HeroContentProps) {
  return (
    <div className="max-w-2xl mt-[30%] mb-[30%] md:my-0">
      {/* Primary Heading */}
      <h1 className="text-center md:text-left text-4xl md:text-6xl lg:text-6xl font-medium text-white leading-tight mb-5">
        {content.primaryHeading}
      </h1>

      {/* Secondary Heading */}
      <h2 className="text-center md:text-left text-4xl md:text-[49px] font-medium text-primary-200 mb-6">
        {content.secondaryHeading}
      </h2>

      {/* Description */}
      <p className="text-xl text-center md:text-left font-light md:text-2xl text-[#D4F4FF] mb-16 leading-relaxed">
        {content.description}
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {content.buttons.map((button, index) => (
          <Button key={index} button={button} className="text-center" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        ))}
      </div>
    </div>
  );
}
