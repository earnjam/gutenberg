/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

const ColorArea = ( { ariaLabel, colorValue, className } ) => (
	<span
		className={ classnames( 'color-area', className ) }
		aria-label={ ariaLabel }
		style={ { background: colorValue } }
	/>
);

export default ColorArea;
