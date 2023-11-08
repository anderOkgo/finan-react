import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const AutoDismissMessage = ({ msg, bgColor, duration, setVisible, visible }) => {
  useEffect(() => {
    setVisible(visible);

    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [visible, duration, setVisible]);

  // Set the initial opacity to 1 (fully visible)
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Gradually reduce the opacity to 0 over the duration
    if (visible) {
      const start = Date.now();
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
            width: '98%',
            marginBottom: '5px',
            padding: '0.5rem',
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
            backgroundColor: bgColor,
            borderRadius: '0.5rem',
            opacity: opacity, // Set the opacity based on the state
          }}
        >
          <p dangerouslySetInnerHTML={{ __html: msg }} />
        </div>
      )}
    </div>
  );
};

AutoDismissMessage.propTypes = {
  msg: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
};

export default AutoDismissMessage;
