import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import BookCoverSvg from "./BookCoverSvg";

type BookCoverVriant = "extraSmall" | "small" | "medium" | "regular" | "wide";

const variantStyles: Record<BookCoverVriant, string> = {
  extraSmall: "book-cover_extra_small",
  small: "book-cover_small",
  medium: "book-cover_medium",
  regular: "book-cover_regular",
  wide: "book-cover_wide",
};

interface Props {
  className?: string;
  variant?: BookCoverVriant;
  coverColor: string;
  coverImage: string;
}

const BookCover = ({
  className,
  variant = "regular",
  coverColor = "#012B48",
  coverImage = "https://placehold.co/400x600.png",
}: Props) => {
  return (
    <div
      className={cn(
        "relative transition-all duration-300",
        variantStyles[variant],
        className,
      )}
    >
        <BookCoverSvg coverColor={coverColor}/>
     {/* the fill prop tells it to:Absolutely position the img inside relative container and fill the entire width and height of container */}
        <div className="absolute z-10 left-[12%] h-[88%] w-[87.5%]">
            <Image src={coverImage} alt="book cover" fill className="rounded-sm object-fill"/>
        </div>
    </div>
  );
};

export default BookCover;
