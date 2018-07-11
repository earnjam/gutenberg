/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import PanelBody from './body';
import ColorArea from '../color-area';

const Title = ( { title, backgroundColor, textColor } ) => {
	// translators: %s: The name of the color e.g: "vivid red" or color hex code if name is not available e.g: "#f00".
	const backgroundColorLabel = sprintf( __( '(current background color: %s)' ), backgroundColor.name || backgroundColor.value );

	// translators: %s: The name of the color e.g: "vivid red" or color hex code if name is not available e.g: "#f00".
	const textColorLabel = sprintf( __( '(current text color: %s)' ), textColor.name || textColor.value );

	return (
		<Fragment>
			<span
				className="components-panel__color-title"
				key="title">
				{ title }
			</span>
			{ !! backgroundColor.value && (
				<ColorArea
					className="components-panel__color-area"
					ariaLabel={ backgroundColorLabel }
					colorValue={ backgroundColor.value }
				/>
			) }
			{ !! textColor.value && (
				<ColorArea
					className="components-panel__color-area"
					ariaLabel={ textColorLabel }
					colorValue={ textColor.value }
				/>
			) }
		</Fragment>
	);
};

const PanelTextColor = ( { title, backgroundColor, textColor, ...props } ) => {
	const titleElement = (
		<Title { ...{ title, backgroundColor, textColor } } />
	);

	return (
		<PanelBody
			className="components-panel--text-color"
			title={ titleElement }
			{ ...props }
		/>
	);
};

export default PanelTextColor;
