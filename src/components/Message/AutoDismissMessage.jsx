import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const AutoDismissMessage = ({ msg, bgColor, duration, setVisible, visible }) => {
  useEffect(() => {
    setVisible(visible);

    if (visible) {
      // Set initial opacity after the delay
      const initialOpacityTimeout = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => {
        clearTimeout(initialOpacityTimeout);
      };
    }
  }, [visible, duration, setVisible]);

  // Set the initial opacity to 1 (fully visible)
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Gradually reduce the opacity to 0 over the duration
    if (visible) {
      const start = Date.now() + 1000; // Add the delay to the start time
      const animate = () => {
        const now = Date.now();
        const elapsed = now - start;
        if (elapsed < duration) {
          // Calculate the new opacity value
          const newOpacity = 1 - elapsed / duration;
          setOpacity(newOpacity);
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [visible, duration]);

  return (
    <div>
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: '9.9vh',
            right: '0',
            width: '100%',
            padding: '0.2rem',
            textAlign: 'center',
            color: 'var(--text-alt)',
            fontWeight: 'bold',
            backgroundColor: bgColor,
            opacity: opacity,
            textShadow: '2px 2px 2px black',
          }}
        >
          <p dangerouslySetInnerHTML={{ __html: msg }} />
        </div>
      )}
    </div>
  );
};

AutoDismissMessage.propTypes = {
  msg: PropTypes.any.isRequired,
  bgColor: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
};

export default AutoDismissMessage;
