/**
 * WordPress dependencies
 */
import { ifCondition, PanelBody, BaseControl } from '@wordpress/components';
import { compose, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ContrastChecker from '../contrast-checker';
import ColorPalette from '../color-palette';
import withColorContext from '../color-palette/with-color-context';
import { getColorName } from '../colors';

const getLabelText = ( templateText, colorValue, colors ) => {
	const textColorName = getColorName( colors, colorValue );
	return sprintf( templateText, textColorName || colorValue );
};

const getTitle = ( title, textColorProps, backgroundColorProps, colors ) => {
	const backgroundColorValue = backgroundColorProps.value;
	const backgroundColorLabel = getLabelText( __( '(current background color: %s)' ), backgroundColorValue, colors );
	const textColorValue = textColorProps.value;
	const textColorLabel = getLabelText( __( '(current text color: %s)' ), textColorValue, colors );

	return (
		<Fragment>
			<span
				className="components-panel__color-title"
				key="title">
				{ title }
			</span>
			{ backgroundColorValue && (
				<span
					className="components-panel__color-area"
					aria-label={ backgroundColorLabel }
					style={ { background: backgroundColorValue } }
				/>
			) }
			{ textColorValue && (
				<span
					className="components-panel__color-area"
					aria-label={ textColorLabel }
					style={ { background: textColorValue } }
				/>
			) }
		</Fragment>
	);
};

function PanelTextColor( { title, colors, textColorProps, backgroundColorProps, contrastCheckerProps } ) {
	return (
		<PanelBody
			title={ getTitle( title, textColorProps, backgroundColorProps, colors ) }
		>
			<BaseControl label={ __( 'Background Color' ) }>
				<ColorPalette { ...backgroundColorProps } />
			</BaseControl>

			<BaseControl label={ __( 'Text Color' ) } >
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
