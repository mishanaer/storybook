import PropTypes from "prop-types"

import "./TargetButton.css"

const TargetButton = ({ children }) => (
    <button className="target-button" type="button">
        {children}
    </button>
)

TargetButton.propTypes = {
    children: PropTypes.node,
}

export default TargetButton
