import React from 'react';
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
			if (typeof value == 'undefined') return null;

			if (editable && !multiple && !richText) {
				return (
					<Formik
						enableReinitialize={true}
						initialValues={{ [id]: value }}
						onSubmit={values => onChange({ ...values, Id: original.Id })}
						validateOnBlur={false}
						validateOnChange={false}>
						{({ handleChange, submitForm, values }) => (
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
					</Formik>
				);
			}

			if (format.length != 0) {
				return (
					<InputText
						disabled={true}
						format={format}
						id={id}
						onBlur={() => {}}
						onChange={() => {}}
						onPressEnter={() => {}}
						withLabel={false}
						value={values[id]}
					/>
				);
			}
			return <span>{stripHTMLTags ? striptags(value) : value}</span>;
		},
		Filter: ({ filter, onChange }) => {
			return (
				<Formik
					enableReinitialize={true}
					initialValues={{ filter: filter ? filter.value : '' }}
					onSubmit={values => onChange(values.filter)}
					validateOnBlur={false}
					validateOnChange={false}>
					{({ handleChange, submitForm, values }) => (
						<InputText
							id="filter"
							onBlur={submitForm}
							onChange={e => {
								handleChange(e);
								if (values.filter != '' && e.target.value == '') submitForm(e);
							}}
							onPressEnter={submitForm}
							placeholder="Search..."
							withLabel={false}
							value={values.filter}
						/>
					)}
				</Formik>
			);
		}
	};
};
