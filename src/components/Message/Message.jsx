import PropTypes from 'prop-types';

const Message = ({ msg, bgColor }) => {
  let styles = {
    padding: '1rem',
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: bgColor,
  };

  return (
    <div style={styles}>
      <p dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
};

Message.propTypes = {
  msg: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
};

export default Message;
