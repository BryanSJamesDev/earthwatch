import PropTypes from "prop-types";

// an event as the api returns it (dates and ids are json strings)
export const eventShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  severity: PropTypes.number.isRequired,
  region: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  authorId: PropTypes.string,
  authorName: PropTypes.string,
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
});

export const userShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
});

export const optionsShape = PropTypes.shape({
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  regions: PropTypes.arrayOf(PropTypes.string).isRequired,
  severities: PropTypes.arrayOf(PropTypes.string).isRequired,
});
