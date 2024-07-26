import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@chakra-ui/react';

export default function ActionButton({ className, disabled, icon, onClick }) {
  return (
    <Button
      className=""
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} color="white" />
    </Button>
  );
}

ActionButton.defaultProps = {
  className: null,
  disabled: false
};

// ActionButton.propTypes = {
//   disabled: PropTypes.bool,
//   className: PropTypes.string,
//   // eslint-disable-next-line react/forbid-prop-types
//   icon: PropTypes.object.isRequired,
//   onClick: PropTypes.func.isRequired
// };
