/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { ifCondition, PanelBody, BaseControl } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ColorPalette from '../color-palette';
import withColorContext from '../color-palette/with-color-context';
import { getColorName } from '../colors';

const getLabelText = ( templateText, colorValue, colors ) => {
	const textColorName = getColorName( colors, colorValue );
	return sprintf( templateText, textColorName || colorValue );
};

function PanelColor( { title, colors, textColorValue, backgroundColorValue, onChangeTextColor, onChangeBackgroundColor, ...props } ) {
	const textColorLabel = getLabelText( __( '(current text color: %s)' ), textColorValue, colors );
	const backgroundColorLabel = getLabelText( __( '(current background color: %s)' ), backgroundColorValue, colors );

	const titleElements = [
		<span className="components-panel__color-title" key="title">{ title }</span>,
		backgroundColorValue && (
			<span className="components-panel__color-area" aria-label={ backgroundColorLabel } key="color" style={ { background: backgroundColorValue } } />
		),
		textColorValue && (
			<span className="components-panel__color-area" aria-label={ textColorLabel } key="color" style={ { background: textColorValue } } />
		),
	];

	return (
		<PanelBody
			title={ titleElements }
		>
			<BaseControl
				label={ __( 'Background Color' ) }
				className="components-toggle-control"
			>
				<ColorPalette
					value={ backgroundColorValue }
					onChange={ onChangeBackgroundColor }
					{ ...omit( props, [ 'disableCustomColors' ] ) }
				/>
			</BaseControl>

			<BaseControl
				label={ __( 'Text Color' ) }
				className="components-toggle-control"
			>
				<ColorPalette
					value={ textColorValue }
					onChange={ onChangeTextColor }
					{ ...omit( props, [ 'disableCustomColors' ] ) }
				/>
			</BaseControl>
		</PanelBody>
	);
}

export default compose( [
	withColorContext,
	ifCondition( ( { hasColorsToChoose } ) => hasColorsToChoose ),
] )( PanelColor );
