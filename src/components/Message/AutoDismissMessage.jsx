import { useEffect } from 'react';
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

  return (
    <div>
      {visible && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
            backgroundColor: bgColor,
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
