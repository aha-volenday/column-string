import React from 'react';
import Cleave from 'cleave.js/react';
import InputText from '@volenday/input-text';
import striptags from 'striptags';
import { Formik } from 'formik';

export default props => {
	const {
		editable = false,
		stripHTMLTags = false,
		format = [],
		headerStyle = {},
		id,
		multiple = false,
		onChange,
		richText,
		onChangeText,
		style = {},
		...defaultProps
	} = props;

	return {
		...defaultProps,
		style: { ...style, display: 'flex', alignItems: 'center' },
		headerStyle: { ...headerStyle, display: 'flex', alignItems: 'center' },
		Cell: ({ original, value }) => {
			if (editable && !multiple && !richText) {
				return (
					<Formik
						enableReinitialize={true}
						initialValues={{ [id]: value }}
						onSubmit={values => onChange({ ...values, Id: original.Id })}
						validateOnBlur={false}
						validateOnChange={false}
						render={({ handleChange, submitForm, values }) => (
							<InputText
								format={format}
								id={id}
								onBlur={submitForm}
								onChange={handleChange}
								onPressEnter={e => {
									submitForm(e);
									e.target.blur();
								}}
								withLabel={false}
								value={values[id]}
							/>
						)}
					/>
				);
			}

			if (format.length != 0) {
				let blocks = format.map(d => parseInt(d.characterLength)),
					delimiters = format.map(d => d.delimiter);
				delimiters.pop();
				return (
					<Cleave
						disabled={true}
						options={{ delimiters, blocks }}
						value={value}
						style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}
					/>
				);
			}
			return <span>{stripHTMLTags ? striptags(value) : value}</span>;
		},
		Filter: ({ filter, onChange }) => {
			return (
				<input
					type="text"
					class="form-control"
					onChange={e => onChange(e.target.value)}
					value={filter ? filter.value : ''}
					placeholder="Search..."
				/>
			);
		}
	};
};
