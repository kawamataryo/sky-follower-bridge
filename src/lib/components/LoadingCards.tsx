import { motion } from "framer-motion";
import React from "react";
import UserCardSkeleton from "./UserCardSkeleton";

const CARD_COLORS = ["#266678", "#cb7c7a", " #36a18b", "#cda35f", "#747474"];
const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.06;

const moveArrayItem = (arr: string[], fromIndex: number, toIndex: number) => {
  const newArray = [...arr];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
};

const LoadingCards = () => {
  const [cards, setCards] = React.useState(CARD_COLORS);

  const moveToEnd = (from: number) => {
    setCards((prevCards) =>
      moveArrayItem(prevCards, from, prevCards.length - 1),
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    const interval = setInterval(() => {
      moveToEnd(0);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[100px] w-[400px] mt-[50px]">
      <ul className="relative">
        {cards.map((color, index) => {
          return (
            <motion.li
              key={color}
              className="absolute w-[400px] card bg-base-100 border border-gray-400"
              layout
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex: CARD_COLORS.length - index,
                opacity: 1 - index * 0.2,
              }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                layout: { duration: 0.8 },
                opacity: { duration: 0.4 },
              }}
            >
              <UserCardSkeleton />
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(LoadingCards);
