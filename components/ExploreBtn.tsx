import Image from "next/image";

const ExploreBtn = () => {
  return (
    <a
      href="#events"
      id="explore-btn"
      className="mt-7 mx-auto"
    >
      Explore Events
      <Image
        src="/icons/arrow-down.svg"
        alt="Arrow Down Icon"
        width={24}
        height={24}
      />
    </a>
  );
};

export default ExploreBtn;
