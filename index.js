import React from 'react';
import InputText from '@volenday/input-text';
import striptags from 'striptags';
import { Formik } from 'formik';

export default props => {
	const {
		editable = false,
		stripHTMLTags = false,
		format = [],
		id,
		multiple = false,
		onChange,
		richText,
		...defaultProps
	} = props;

	return {
		...defaultProps,
		Cell: ({ row: { original }, value }) => {
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

			return <span>{stripHTMLTags ? striptags(value) : value}</span>;
		},
		Filter: ({ column: { filterValue, setFilter } }) => {
			let timeout = null;

			return (
				<Formik
					enableReinitialize={true}
					initialValues={{ filter: filterValue ? filterValue : '' }}
					onSubmit={values => setFilter(values.filter)}
					validateOnBlur={false}
					validateOnChange={false}>
					{({ handleChange, submitForm, values }) => (
						<InputText
							id="filter"
							onChange={e => {
								handleChange(e);
								if (values.filter != '' && e.target.value == '') {
									submitForm(e);
								} else {
									timeout && clearTimeout(timeout);
									timeout = setTimeout(() => submitForm(e), 300);
								}
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
