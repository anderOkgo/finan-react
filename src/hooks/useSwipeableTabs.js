import { useState } from 'react';

function useSwipeableTabs(initialOption = 1, numOptions = 4, swipeThreshold = 120) {
  const [selectedOption, setSelectedOption] = useState(initialOption);

  // Handle swipe gestures
  let startX = null;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startX === null) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > swipeThreshold) {
      // Determine the direction of the swipe
      if (deltaX > 0) {
        // Swipe to the right, select the previous option
        setSelectedOption((prevOption) => Math.max(prevOption - 1, 1));
      } else {
        // Swipe to the left, select the next option
        setSelectedOption((prevOption) => Math.min(prevOption + 1, numOptions));
      }
    }

    startX = null;
  };

  return { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd };
}

export default useSwipeableTabs;
