/**
 * WordPress dependencies
 */
import {
	ifCondition,
	PanelBody,
	BaseControl,
	ColorArea,
} from '@wordpress/components';
import { compose, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ContrastChecker from '../contrast-checker';
import ColorPalette from '../color-palette';
import withColorContext from '../color-palette/with-color-context';
import { getColorName } from '../colors';

const getColorAreaProps = ( colors, colorValue, ariaLabelTemplate ) => {
	if ( ! colorValue ) {
		return;
	}

	const colorName = getColorName( colors, colorValue );

	return {
		colorValue,
		ariaLabel: sprintf( ariaLabelTemplate, colorName || colorValue ),
	};
};

const getTitle = ( title, colorAreaProps ) => (
	<Fragment>
		{ title }
		{ colorAreaProps.map( ( props, index ) => (
			props && <ColorArea
				key={ index }
				{ ...props }
			/>
		) ) }
	</Fragment>
);

function PanelTextColor( { title, colors, backgroundColorProps, textColorProps, contrastCheckerProps } ) {
	// translators: %s: The name of the color e.g: "vivid red" or color hex code if name is not available e.g: "#f00".
	const backgroundAriaLabelTemplate = __( '(current background color: %s)' );
	const backgroundColorValue = backgroundColorProps.value;
	const backgroundColorAreaProps = getColorAreaProps( colors, backgroundColorValue, backgroundAriaLabelTemplate );

	// translators: %s: The name of the color e.g: "vivid red" or color hex code if name is not available e.g: "#f00".
	const textAriaLabelTemplate = __( '(current text color: %s)' );
	const textColorValue = textColorProps.value;
	const textColorAreaProps = getColorAreaProps( colors, textColorValue, textAriaLabelTemplate );

	return (
		<PanelBody
			title={ getTitle( title, [ backgroundColorAreaProps, textColorAreaProps ] ) }
		>
			<BaseControl label={ getTitle( __( 'Background Color' ), [ backgroundColorAreaProps ] ) }>
				<ColorPalette { ...backgroundColorProps } />
			</BaseControl>

			<BaseControl label={ getTitle( __( 'Text Color' ), [ textColorAreaProps ] ) } >
				<ColorPalette { ...textColorProps } />
			</BaseControl>

			<ContrastChecker { ...contrastCheckerProps } />
		</PanelBody>
	);
}

export default compose( [
	withColorContext,
	ifCondition( ( { hasColorsToChoose } ) => hasColorsToChoose ),
] )( PanelTextColor );
