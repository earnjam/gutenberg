/**
 * WordPress dependencies
 */
import { ifCondition, BaseControl, PanelTextColor as PanelTextColorComponent } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import ColorPalette from '../color-palette';
import ContrastChecker from '../contrast-checker';
import withColorContext from '../color-palette/with-color-context';
import { getColorName } from '../colors';

function PanelTextColor( { title, colors, backgroundColorProps, textColorProps, contrastCheckerProps } ) {
	const backgroundColorValue = backgroundColorProps.value;
	const textColorValue = textColorProps.value;

	return (
		<PanelTextColorComponent
			title={ title }
			backgroundColor={ {
				name: getColorName( colors, backgroundColorValue ),
				value: backgroundColorValue,
			} }
			textColor={ {
				name: getColorName( colors, textColorValue ),
				value: textColorValue,
			} }
		>
			<BaseControl label={ __( 'Background Color' ) }>
				<ColorPalette { ...backgroundColorProps } />
			</BaseControl>

			<BaseControl label={ __( 'Text Color' ) } >
				<ColorPalette { ...textColorProps } />
			</BaseControl>

			<ContrastChecker { ...contrastCheckerProps } />
		</PanelTextColorComponent>
	);
}

export default compose( [
	withColorContext,
	ifCondition( ( { hasColorsToChoose } ) => hasColorsToChoose ),
] )( PanelTextColor );
