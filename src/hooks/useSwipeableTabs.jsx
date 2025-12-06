import { useState } from 'react';

const SWIPE_THRESHOLD = 170;
const NUM_OPTIONS = 4;

// Custom hook for managing swipeable tabs
function useSwipeableTabs(numOptions = NUM_OPTIONS, swipeThreshold = SWIPE_THRESHOLD) {
  const [selectedOption, setSelectedOption] = useState(1);

  let startX;
  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX; // Store the X position of touch start
  };

  // Event handler for touch end
  const handleTouchEnd = (e) => {
    if (startX === null) return; // Return if startX is null (no touch start recorded)

    // Verificar si el swipe viene de un input range
    const target = e.target;
    if (target.type === 'range' || target.closest('input[type="range"]')) {
      startX = null;
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX; // Calculate the horizontal distance swiped

    // Check if the absolute value of the swipe distance exceeds the threshold
    if (Math.abs(deltaX) > swipeThreshold) {
      // Determine the direction of swipe and update selected option accordingly
      deltaX > 0
        ? setSelectedOption((prevOption) => Math.max(prevOption - 1, 1)) // Swipe to the right, select the previous option
        : setSelectedOption((prevOption) => Math.min(prevOption + 1, numOptions)); // Swipe to the left, select the next option
    }

    startX = null;
  };

  return { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd };
}

export default useSwipeableTabs;
