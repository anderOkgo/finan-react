import { useState, useRef } from 'react';

const SWIPE_THRESHOLD = 170;
const NUM_OPTIONS = 4;

// Custom hook for managing swipeable tabs
function useSwipeableTabs(numOptions = NUM_OPTIONS, swipeThreshold = SWIPE_THRESHOLD, onSwipeChange = null) {
  const [selectedOption, setSelectedOption] = useState(1);
  const startXRef = useRef(null);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX; // Store the X position of touch start
  };

  // Event handler for touch end
  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return; // Return if startX is null (no touch start recorded)

    // Verificar si el swipe viene de un input range
    const target = e.target;
    if (target.type === 'range' || target.closest('input[type="range"]')) {
      startXRef.current = null;
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startXRef.current; // Calculate the horizontal distance swiped

    // Check if the absolute value of the swipe distance exceeds the threshold
    if (Math.abs(deltaX) > swipeThreshold) {
      let newOption;
      
      // Determine the direction of swipe and calculate new option
      if (deltaX > 0) {
        // Swipe to the right, select the previous option
        newOption = Math.max(selectedOption - 1, 1);
      } else {
        // Swipe to the left, select the next option
        newOption = Math.min(selectedOption + 1, numOptions);
      }
      
      // Solo actualizar si cambió
      if (newOption !== selectedOption) {
        // Actualizar el estado
        setSelectedOption(newOption);
        
        // Llamar callback inmediatamente si existe
        if (onSwipeChange) {
          onSwipeChange(newOption);
        }
      }
    }

    startXRef.current = null;
  };

  return { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd };
}

export default useSwipeableTabs;
