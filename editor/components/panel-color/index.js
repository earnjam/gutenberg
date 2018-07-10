/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { ifCondition, PanelBody } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ColorPalette from '../color-palette';
import withColorContext from '../color-palette/with-color-context';
import { getColorName } from '../colors';

function PanelColor( { title, colors, textColorValue, backgroundColorValue, ...props } ) {
	const textColorName = getColorName( colors, textColorValue );
	const textColorLabel = sprintf( __( '(current text color: %s)' ), textColorName || textColorValue );

	const backgroundColorName = getColorName( colors, textColorValue );
	const backgroundColorLabel = sprintf( __( '(current background color: %s)' ), backgroundColorName || backgroundColorValue );

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
			<ColorPalette
				value={ backgroundColorValue }
				{ ...omit( props, [ 'disableCustomColors' ] ) }
			/>

			<ColorPalette
				value={ textColorValue }
				{ ...omit( props, [ 'disableCustomColors' ] ) }
			/>
		</PanelBody>
	);
}

export default compose( [
	withColorContext,
	ifCondition( ( { hasColorsToChoose } ) => hasColorsToChoose ),
] )( PanelColor );
